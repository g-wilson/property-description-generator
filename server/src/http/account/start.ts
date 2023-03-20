import { ServerContext } from '../middleware/context'

type StartRequest = Record<string, never>

type StartResponse = {
	account_id: string
}

export async function handler(ctx: ServerContext<StartRequest, StartResponse>) {
	const auth = ctx.getAuth()
	const accountService = ctx.getAccountService()

	const acc = await accountService.ensureAccountForUser(auth.getUser())

	ctx.body = {
		account_id: acc._id,
	}
}
