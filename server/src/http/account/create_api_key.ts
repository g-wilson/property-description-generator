import createHttpError from 'http-errors'
import { middleware as jsonschema } from 'koa-json-schema'

import { ServerContext } from '../middleware/context.js'
import { ListedAPIKey, toReturnableAPIKey } from './adapter.js'

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

type CreateAPIKeyRequest = Record<string, never>

type CreateAPIKeyResponse = {
	key: ListedAPIKey
	secret: string
}

export async function handler(ctx: ServerContext<CreateAPIKeyRequest, CreateAPIKeyResponse>) {
	const { account_id: accountId } = ctx.params
	const apikeyService = ctx.getApikeyService()
	const auth = ctx.getAuth()

	if (auth.getAccount() !== accountId)
		throw createHttpError(404, 'account_not_found')

	const { key, secret } = await apikeyService.create(accountId, auth.getUser())

	ctx.body = {
		key: toReturnableAPIKey(key),
		secret,
	}
}
