import { Context, Middleware } from 'koa'
import httpError from 'http-errors'

import { ErrMsg } from '../types.js'

export default function notFoundMiddleware(): Middleware {
	return async (ctx: Context) => {
		throw httpError(404, ErrMsg.RouteNotFound, { expose: true, cause: `${ctx.method} method on URL ${ctx.originalUrl} does not exist` })
	}
}
