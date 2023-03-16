import { ServerContext } from '../middleware/context'

export async function handler(ctx: ServerContext) {
	const auth = ctx.getAuth()
	const accountService = ctx.getAccountService()

	const acc = await accountService.ensureAccountForUser(auth.getUser())

	await accountService.checkTermsAgreed(acc._id)

	ctx.status = 204
}
