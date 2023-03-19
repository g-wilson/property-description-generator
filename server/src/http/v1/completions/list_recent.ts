import { middleware as jsonschema } from 'koa-json-schema'

import { ListedCompletion, toReturnableCompletion } from './adapter.js'
import { ServerContext } from '../../middleware/context.js'
import { COMPLETION_TYPES } from '../../../app/services/completions/types.js'

export const schema = jsonschema({
	type: 'object',
	required: [],
	additionalProperties: false,
	properties: {
		limit: {
			type: 'string',
			pattern: '^[0-9]{1,2}$'
		},
	},
})

export type ListCompletionsResponse = {
	completions: ListedCompletion[]
}

export async function handler(ctx: ServerContext<void, ListCompletionsResponse>) {
	const completionService = ctx.getCompletionService()
	const auth = ctx.getAuth()

	const { limit } = ctx.query
	const numLimit = limit ? parseInt(limit as string, 10) : 10

	const cmpls = await completionService.listRecentForAccount(auth.getAccount(), COMPLETION_TYPES.UK_PROPERTY_LISTING_V1, numLimit)

	ctx.body = {
		completions: cmpls.map(toReturnableCompletion),
	}
}
