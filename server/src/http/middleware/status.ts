import { Context, Next, Middleware } from 'koa'

const status = {
	status: '👍',
}

export default function createStatusMiddleware(): Middleware {
	return async (ctx: Context, next: Next) => {
		if (ctx.path === '/') {
			ctx.body = status

			return
		}

		await next()
	}
}
