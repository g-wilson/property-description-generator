import createHttpError from 'http-errors'
import { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai'

import { AIChatCompletor, LocationHelperInterface, UKPropertyListingPromptParams } from './types.js'
import { CompletionServiceInterface, COMPLETION_TYPES } from '../completions/types.js'

export class UKPropertyService {

	private readonly modelOptions = {
		model: 'gpt-3.5-turbo',
		// suffix: '|||',
		max_tokens: 512,
		temperature: 0.5,
		// top_p: 1,
	}

	private locationHelper: LocationHelperInterface

	private completionService: CompletionServiceInterface

	private chatClient: AIChatCompletor

	constructor(opts: {
		chatClient: AIChatCompletor,
		locationsClient: LocationHelperInterface,
		completionService: CompletionServiceInterface,
	}) {
		this.chatClient = opts.chatClient
		this.locationHelper = opts.locationsClient
		this.completionService = opts.completionService
	}

	/* eslint-disable quotes,max-len */
	private createPrompt(params: UKPropertyListingPromptParams): ChatCompletionRequestMessage[] {
		const basePrompt = [
			`Generate a description for a property listing for in the style of Rightmove and Zoopla`,
			`The type of property is ${params.property_type} across ${params.floors} floors.`,
			`It has ${params.bedrooms} bedrooms and ${params.bathrooms} bathrooms.`,
			`The property has the postcode of ${params.postcode} which is in the United Kingdom.`,
		]

		let locationPrompt: string[] = []
		if (params.nearby_locations.length) {
			locationPrompt = [
				`The local places and ameneties nearby are:`,
				...params.nearby_locations.map(l => `${l.name} is a ${l.type} which is ${l.distance_km}km away;`),
				`Mention these places in the listing Do not mention any other nearby places other than these.`,
			]
		} else {
			locationPrompt = [ 'It it does not have any nearby ameneties but may be a short drive away from somewhere more populated.' ]
		}

		return [
			{ role: 'system', content: 'You are helpfully generating passages of text which will be published on a website.' },
			{ role: 'user', content: [ ...basePrompt, ...locationPrompt ].join('\n') },
		]
	}
	/* eslint-enable */

	async generateDescription(accountId: string, userId: string, params: UKPropertyListingPromptParams): Promise<string> {
		const location = await this.locationHelper.geocodePostcode(params.postcode)
		const nearbyPlaces = await this.locationHelper.getNearbyLocations(location)

		const req: CreateChatCompletionRequest = {
			...this.modelOptions,
			user: accountId,
			messages: this.createPrompt({ ...params, nearby_locations: nearbyPlaces }),
		}

		const cmpl = await this.completionService.createPending(
			accountId,
			userId,
			COMPLETION_TYPES.UK_PROPERTY_LISTING_V1,
			{
				model_options: this.modelOptions,
				uk_property_params: params,
				location,
				nearby_locations: nearbyPlaces,
			},
		)

		try {
			const res = await this.chatClient.createChatCompletion(req)

			await this.completionService.updateSuccess(cmpl._id, res)

			return res.response
		} catch (e) {
			let errMsg = 'unknown'

			if (e instanceof Error)
				errMsg = e.message

			await this.completionService.updateFailed(cmpl._id, errMsg)

			throw createHttpError(500, 'openai_error', { error: e })
		}
	}

}
