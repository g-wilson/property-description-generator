import { middleware as jsonschema } from 'koa-json-schema'

import { UKPropertyService, UKPropertyListingPromptParams } from '../../services/ukproperty/index.js'
import { ServerContext } from '../middleware/context.js'

export const schema = jsonschema({
	type: 'object',
	required: [
		'postcode',
		'property_type',
		'floors',
		'bedrooms',
		'bathrooms',
	],
	additionalProperties: false,
	properties: {
		postcode: {
			type: 'string',
		},
		property_type: {
			type: 'string',
			enum: [
				'house',
				'townhouse',
				'flat',
				'apartment',
				'maisonette',
				'penthouse',
				'castle',
				'villa',
			],
		},
		floors: {
			type: 'number',
		},
		bedrooms: {
			type: 'number',
		},
		bathrooms: {
			type: 'number',
		},
	},
})

type UKPropertyListingRequest = UKPropertyListingPromptParams

type UKPropertyListingResponse = {
	description: string
}

export async function handler(ctx: ServerContext<UKPropertyListingRequest, UKPropertyListingResponse>) {
	const auth = ctx.getAuth()
	const openai = ctx.getOpenAI()
	const completionService = ctx.getCompletionService()
	const params = ctx.request.body

	const ukProperty = new UKPropertyService({ openai, completionService })

	const response = await ukProperty.generateDescription(auth.getAccount(), auth.getUser(), params)

	ctx.body = { description: response }
}
