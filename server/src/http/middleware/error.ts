import { Next } from 'koa'
import createHttpError from 'http-errors'

import { ServerContext } from './context.js'
import { ErrMsg, ErrorResponse, ValidationErrorResponse } from '../types.js'

export default function createErrorMiddleware() {
	return async (ctx: ServerContext<void, ErrorResponse | ValidationErrorResponse>, next: Next) => {
		try {
			await next()
		} catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
			if (err.name === 'UnprocessableEntityError' && err.error_description) {
				err = createHttpError(422, 'validation_error', {
					expose: true,
					description: 'request body did not match the schema',
					details: err.error_description,
				})
			}

			ctx.error = err
			ctx.status = err.status ?? 500

			if (err.expose) {
				ctx.body = {
					message: err.message,
					description: err.description,
					details: err.details,
				}
			} else {
				ctx.body = { message: ErrMsg.RequestFailed }
			}
		}
	}
}
