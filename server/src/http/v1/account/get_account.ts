import createHttpError from 'http-errors'
import { middleware as jsonschema } from 'koa-json-schema'
import { ServerContext } from '../../middleware/context.js'

export const schema = jsonschema({
	type: 'object',
	required: [
		'account_id',
	],
	additionalProperties: false,
	properties: {
		account_id: {
			type: 'string',
			minLen: 1,
		},
	},
})

type GetAccountResponse = {
	id: string
	created_at: Date
	terms_agreed_version: string | null
	terms_agreed_at: Date | null
}

export async function handler(ctx: ServerContext<void, GetAccountResponse>) {
	const { account_id: accountId } = ctx.params
	const accountService = ctx.getAccountService()
	const auth = ctx.getAuth()

	if (auth.getAccount() !== accountId)
		throw createHttpError(404, 'account_not_found')

	const acc = await accountService.getById(accountId)

	ctx.body = {
		id: acc._id,
		created_at: acc.created_at,
		terms_agreed_version: acc.terms_agreed_version,
		terms_agreed_at: acc.terms_agreed_at,
	}
}
