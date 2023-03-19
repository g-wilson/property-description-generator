import createHttpError from 'http-errors'
import { OpenAIApi, CreateChatCompletionRequest } from 'openai'

import { CompletionServiceInterface } from '../completions/types'
import { getRequestLogger } from '../../../lib/logger/index.js'

export type UKPropertyListingCharacter = {
	new_build: boolean
	period: boolean
	modern?: boolean
	georgian?: boolean
	edwardian?: boolean
	victorian?: boolean
	twenties?: boolean
	thirties?: boolean
	forties?: boolean
	fifties?: boolean
	sixties?: boolean
	seventies?: boolean
	eighties?: boolean
	nineties?: boolean
	conversion?: boolean
	barn_conversion?: boolean
	townhouse?: boolean
	maisonette?: boolean
	farmhouse?: boolean
	cottage?: boolean
	manor?: boolean
}

export type UKPropertyListingInterior = {
	dated?: boolean
	needs_renovation?: boolean
	modern?: boolean
	modern_kitchen?: boolean
	modern_bathroom?: boolean
	recent_renovation?: boolean
	open_plan_living?: boolean
	kitchen_dining?: boolean
	ensuite_master?: boolean
	multiple_ensuite?: boolean
	utility_room?: boolean
	annexe?: boolean
	stone_floor?: boolean
	wood_floor?: boolean
	tiled_floor?: boolean
}

export type UKPropertyListingExterior = {
	land_acres?: number
	garden_acres?: number
	garden?: boolean
	front_garden?: boolean
	terrace?: boolean
	balcony?: boolean
	car_port?: boolean
	garage?: boolean
	double_garage?: boolean
	onstreet_parking?: boolean
	offstreet_parking?: boolean
	secure_parking?: boolean
	storage_unit?: boolean
	outdoor_water?: boolean
	double_glazing?: boolean
}

export type UKPropertyListingLocation = {
	commute_to_large_city?: boolean
	walk_to_station?: boolean
	walk_to_highstreet?: boolean
	walk_to_pub?: boolean
	walk_to_park?: boolean
	nearby_primary_school?: boolean
	nearby_secondary_school?: boolean
	nearby_nature?: boolean
	nearby_national_park?: boolean
	nearby_seaside?: boolean
}

export type UKPropertyListingPromptParams = {
	postcode: string
	property_type: string
	floors: number
	bedrooms: number
	bathrooms: number
	character?: UKPropertyListingCharacter
	interior?: UKPropertyListingInterior
	exterior?: UKPropertyListingExterior
	location?: UKPropertyListingLocation
}

export class UKPropertyService {

	private readonly modelOptions = {
		model: 'gpt-3.5-turbo',
		// suffix: '|||',
		max_tokens: 512,
		temperature: 0.5,
		// top_p: 1,
	}

	private completionService: CompletionServiceInterface

	private openai: OpenAIApi

	constructor(opts: {
		openai: OpenAIApi,
		completionService: CompletionServiceInterface,
	}) {
		this.openai = opts.openai
		this.completionService = opts.completionService
	}

	private createPrompt(params: UKPropertyListingPromptParams): string {
		/* eslint-disable quotes,max-len */
		return [
			`Generate a description for a property listing for in the style of Rightmove and Zoopla`,
			`The type of property is ${params.property_type} across ${params.floors} floors.`,
			`It has ${params.bedrooms} bedrooms and ${params.bathrooms} bathrooms`,
			`It is located in the United Kingdom and has postcode of ${params.postcode}`,
			`The description should mention if there are any shops, pubs, high streets, parks, stations or schools nearby and if they are walking distance.`,
		].join('\n')
		/* eslint-enable */
	}

	async generateDescription(accountId: string, userId: string, params: UKPropertyListingPromptParams): Promise<string> {
		const req: CreateChatCompletionRequest = {
			...this.modelOptions,
			user: accountId,
			messages: [
				{ role: 'system', content: 'You are helpfully generating passages of text which will be published on a website.' },
				{ role: 'user', content: this.createPrompt(params) },
			],
		}

		const cmpl = await this.completionService.createPending(accountId, userId, req)
		const startTime = Date.now()

		try {
			const response = await this.openai.createChatCompletion(req)

			const responseMessage = response.data.choices[0]?.message?.content ?? ''
			if (!responseMessage)
				throw new Error('chat_response_message_missing')

			getRequestLogger().info('openai_completion_success', {
				latency: (Date.now() - startTime),
				openai_completion_id: response.data.id,
				openai_usage: response.data.usage,
			})

			await this.completionService.updateSuccess(cmpl._id, {
				latency: (Date.now() - startTime),
				openai_completion_id: response.data.id,
				openai_usage: response.data.usage,
				openai_choices: response.data.choices,
			})

			return responseMessage
		} catch (e) {
			let errMsg = 'unknown'

			if (e instanceof Error)
				errMsg = e.message

			await this.completionService.updateFailed(cmpl._id, errMsg)

			throw createHttpError(500, 'openai_error', { error: e })
		}
	}

}
