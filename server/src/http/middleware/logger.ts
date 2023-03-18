import { Next, Middleware, DefaultState } from 'koa'
import bunyan from 'bunyan'

import { ServerContext } from './context'
import { GoogleCloudLogger } from '../../lib/google-cloud-logger/index.js'
import { FIREBASE_PROJECT_ID, IS_GCLOUD, COMPONENT_NAME } from '../../lib/service-context/index.js'

const LOG_LEVEL = (process.env.LOG_LEVEL ?? 'info') as bunyan.LogLevel // eslint-disable-line no-process-env

const bunyanConfig: bunyan.LoggerOptions = {
	name: COMPONENT_NAME,
	level: LOG_LEVEL,
}

if (IS_GCLOUD) {
	bunyanConfig.streams = [
		{
			stream: new GoogleCloudLogger(),
			type: 'raw',
		},
	]
} else {
	bunyanConfig.streams = [
		{
			stream: process.stdout,
		},
	]
}

export const logger = bunyan.createLogger(bunyanConfig)

export function requestLogger(): Middleware<DefaultState, ServerContext> {
	return async (ctx: ServerContext, next: Next) => {
		ctx.log = logger.child({})

		attachTraceHeader(ctx)

		ctx.log.fields.httpRequest = {
			requestUrl: ctx.originalUrl,
			requestMethod: ctx.method,
			requestSize: ctx.request.length,
			userAgent: ctx.headers['user-agent'],
			remoteIp: ctx.ip,
		}

		await next()

		ctx.log.fields.httpRequest.status = ctx.response.status
		ctx.log.fields.httpRequest.responseSize = ctx.response.length

		if (ctx.error) {
			ctx.log.fields.error = ctx.error.message
			ctx.log.fields.errorCause = ctx.error.cause
			ctx.log.fields.errorStack = ctx.error.stack
			ctx.log.fields.errorDetails = ctx.error.details

			if (ctx.error.status && ctx.error.status < 500)
				ctx.log.warn('request_handled_error')
			else
				ctx.log.error('request_unhandled_error')
		} else {
			ctx.log.info('request_success')
		}
	}
}

function attachTraceHeader(ctx: ServerContext) {
	if (!ctx.log)
		throw new Error('expected ctx.log instance')

	const gcloudTraceHeader = ctx.request.headers['x-cloud-trace-context']
	if (typeof gcloudTraceHeader === 'string') {
		const [ traceId ] = gcloudTraceHeader.split('/')

		ctx.log.fields['logging.googleapis.com/trace'] = `projects/${FIREBASE_PROJECT_ID}/traces/${traceId}`
	}
}
