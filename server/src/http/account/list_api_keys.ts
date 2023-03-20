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

type ListAPIKeysResponse = {
	keys: ListedAPIKey[]
}

export async function handler(ctx: ServerContext<void, ListAPIKeysResponse>) {
	const { account_id: accountId } = ctx.params
	const apikeyService = ctx.getApikeyService()
	const auth = ctx.getAuth()

	if (auth.getAccount() !== accountId)
		throw createHttpError(404, 'account_not_found')

	const keys = await apikeyService.listActive(accountId)

	ctx.body = {
		keys: keys.map(toReturnableAPIKey),
	}
}
