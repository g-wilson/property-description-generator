import { Next, Middleware, DefaultState, Context } from 'koa'
import bunyan from 'bunyan'
import { createNamespace } from 'cls-hooked'

import { GoogleCloudLogStreamer } from './google-cloud-logger/index.js'
import { FIREBASE_PROJECT_ID, IS_GCLOUD, COMPONENT_NAME } from '../../lib/service-context/index.js'

const LOG_LEVEL = (process.env.LOG_LEVEL ?? 'info') as bunyan.LogLevel // eslint-disable-line no-process-env

const CLS_NAMESPACE = 'cls-logger'

const CLS_KEY = 'request-log'

const bunyanConfig: bunyan.LoggerOptions = (() => {
	const c: bunyan.LoggerOptions = {
		name: COMPONENT_NAME,
		level: LOG_LEVEL,
	}

	if (IS_GCLOUD) {
		c.streams = [
			{
				stream: new GoogleCloudLogStreamer(),
				type: 'raw',
			},
		]
	} else {
		c.streams = [
			{
				stream: process.stdout,
			},
		]
	}

	return c
})()

// logger is the single root logger instance used across the server.
export const logger = bunyan.createLogger(bunyanConfig)

// clsSession is our continuation-local-storage namespace.
const clsSession = createNamespace(CLS_NAMESPACE)

// getRequestLogger can be used in any context to retrieve that request's logger from the cls namespace.
export function getRequestLogger(): bunyan {
	const l = clsSession.get(CLS_KEY)
	if (l)
		return l

	return logger.child({ warning: 'existing request logger not found in cls namespace' })
}

// createMiddleware creates a koa middleware which:
// - attaches the logger to the cls namespace and the request context.
// - adds log fields from the request
// - writes the outcome of the request
export function createMiddleware(): Middleware<DefaultState, Context> {
	return async (ctx: Context, next: Next) => {
		clsSession.bindEmitter(ctx.req)
		clsSession.bindEmitter(ctx.res)

		await clsSession.runPromise(async () => {
			const log = logger.child(getRequestLogFields(ctx))

			ctx.log = log
			clsSession.set(CLS_KEY, log)

			await next()

			ctx.log.fields = { ...ctx.log.fields, ...getResponseLogFields(ctx) }

			if (ctx.error) {
				if (ctx.error.status && ctx.error.status < 500)
					ctx.log.warn('request_handled_error')
				else
					ctx.log.error('request_unhandled_error')
			} else {
				ctx.log.info('request_success')
			}
		})
	}
}

function getRequestLogFields(ctx: Context): Record<string, any> {
	const f: Record<string, any> = {
		httpRequest: {
			requestUrl: ctx.originalUrl,
			requestMethod: ctx.method,
			requestSize: ctx.request.length,
			userAgent: ctx.headers['user-agent'],
			remoteIp: ctx.ip,
		},
	}

	const gcloudTraceHeader = ctx.request.headers['x-cloud-trace-context']
	if (typeof gcloudTraceHeader === 'string') {
		const [ traceId ] = gcloudTraceHeader.split('/')

		f['logging.googleapis.com/trace'] = `projects/${FIREBASE_PROJECT_ID}/traces/${traceId}`
	}

	return f
}

function getResponseLogFields(ctx: Context): Record<string, any> {
	const f: Record<string, any> = {
		httpRequest: ctx.log.fields.httpRequest || {},
	}

	f.httpRequest.status = ctx.response.status
	f.httpRequest.responseSize = ctx.response.length

	const a = ctx.getAuth()

	f.auth_user_id = a.userId
	f.auth_account_id = a.accountId

	if (ctx.error) {
		f.error = ctx.error.message
		f.errorCause = ctx.error.cause
		f.errorStack = ctx.error.stack
		f.errorDetails = ctx.error.details
	}

	return f
}
