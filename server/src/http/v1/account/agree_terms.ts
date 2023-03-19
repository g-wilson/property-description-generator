import createHttpError from 'http-errors'
import { middleware as jsonschema } from 'koa-json-schema'

import { ServerContext } from '../../middleware/context.js'

export const schema = jsonschema({
	type: 'object',
	required: [
		'account_id',
		'terms_version',
	],
	additionalProperties: false,
	properties: {
		account_id: {
			type: 'string',
			minLen: 1,
		},
		terms_version: {
			type: 'string',
			enum: [
				'2023-03-16',
			],
		},
	},
})

type AgreeTermsRequest = {
	terms_version: string
}

export async function handler(ctx: ServerContext<AgreeTermsRequest, void>) {
	const { terms_version: termsVersion } = ctx.request.body
	const { account_id: accountId } = ctx.params
	const accountService = ctx.getAccountService()
	const auth = ctx.getAuth()

	if (auth.getAccount() !== accountId)
		throw createHttpError(404, 'account_not_found')

	await accountService.agreeTerms(auth.getAccount(), termsVersion, auth.getUser())
	await accountService.checkTermsAgreed(auth.getAccount())

	ctx.status = 204
}
