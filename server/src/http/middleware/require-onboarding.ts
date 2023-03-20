import { Middleware, Next, DefaultState } from 'koa'

import { ServerContext } from './context'

export default function createRequireOnboardingMiddleware(): Middleware<DefaultState, ServerContext> {
	return async (ctx: ServerContext, next: Next) => {
		const accountService = ctx.getAccountService()
		const auth = ctx.getAuth()

		await accountService.checkTermsAgreed(auth.getAccount())

		await next()
	}
}
