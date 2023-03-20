import createHttpError from 'http-errors'
import { middleware as jsonschema } from 'koa-json-schema'

import { ServerContext } from '../middleware/context.js'

export const schema = jsonschema({
	type: 'object',
	required: [
		'account_id',
		'key_id',
	],
	additionalProperties: false,
	properties: {
		account_id: {
			type: 'string',
			minLen: 1,
		},
		key_id: {
			type: 'string',
			minLen: 1,
		},
	},
})

type RevokeAPIKeyRequest = {
	key_id: string
}

export async function handler(ctx: ServerContext<RevokeAPIKeyRequest, void>) {
	const { account_id: accountId } = ctx.params
	const { key_id: keyId } = ctx.request.body
	const apikeyService = ctx.getApikeyService()
	const auth = ctx.getAuth()

	if (auth.getAccount() !== accountId)
		throw createHttpError(404, 'account_not_found')

	await apikeyService.revoke(keyId)

	ctx.status = 204
}
