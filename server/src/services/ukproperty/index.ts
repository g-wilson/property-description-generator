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
			`Generate a description for a property listing in the style of Rightmove and Zoopla`,
			`The type of property is ${params.property_type} across ${params.floors} floors.`,
			`It has ${params.bedrooms} bedrooms and ${params.bathrooms} bathrooms.`,
			`The property has the postcode of ${params.postcode} which is in the United Kingdom.`,
		]

		let periodPrompt = ''
		if (params.character?.period) {
			periodPrompt += 'It is a period property'

			switch (true) {
			case params.character?.georgian:
				periodPrompt += 'in the georgian style'
				break
			case params.character?.edwardian:
				periodPrompt += 'in the edwardian style'
				break
			case params.character?.victorian:
				periodPrompt += 'in the victorian style'
				break
			case params.character?.twenties:
				periodPrompt += 'in the twenties style'
				break
			case params.character?.thirties:
				periodPrompt += 'in the thirties style'
				break
			case params.character?.forties:
				periodPrompt += 'in the forties style'
				break
			case params.character?.fifties:
				periodPrompt += 'in the fifties style'
				break
			case params.character?.sixties:
				periodPrompt += 'in the sixties style'
				break
			case params.character?.seventies:
				periodPrompt += 'in the seventies style'
				break
			case params.character?.eighties:
				periodPrompt += 'in the eighties style'
				break
			case params.character?.nineties:
				periodPrompt += 'in the nineties style'
				break
			default:
			}
		} else if (params.character?.new_build) {
			periodPrompt += 'It is a new build property'

			if (params.character?.modern)
				periodPrompt += 'with modern architectural style'
		}
		periodPrompt += '.'

		const interiorPrompt: string[] = [
			'The interior features are:',
		]

		if (params.interior?.dated) {
			interiorPrompt.push('The interior is dated')

			if (params.interior?.needs_renovation)
				interiorPrompt.push('The interior needs renovation')
		} else if (params.interior?.modern) {
			interiorPrompt.push('The interior has modern fittings and fixtures')

			if (params.interior?.needs_renovation)
				interiorPrompt.push('The interior was recently renovated')
		}

		switch (true) {
		case params.interior?.modern_kitchen:
			interiorPrompt.push('It boasts a modern kitchen')
		case params.interior?.modern_bathroom:
			interiorPrompt.push('It boasts modern bathrooms')
		case params.interior?.open_plan_living:
			interiorPrompt.push('It has an open-plan living space')
		case params.interior?.kitchen_dining:
			interiorPrompt.push('It has an kitchen-dining area')
		case params.interior?.ensuite_master:
			interiorPrompt.push('The master bedroom has an ensuite')
		case params.interior?.utility_room:
			interiorPrompt.push('It has a utility room')
		default:
		}

		const exteriorPrompt: string[] = [
			'The exterior features are:',
		]

		switch (true) {
		case params.exterior?.land_acres !== undefined && params.exterior?.land_acres > 0:
			exteriorPrompt.push(`It has ${params.exterior?.land_acres} acres of land`)
		case params.exterior?.garden_acres !== undefined:
			exteriorPrompt.push(`It has ${params.exterior?.land_acres} acre garden`)
		case params.exterior?.garden:
			exteriorPrompt.push(`It has a garden`)
		case params.exterior?.front_garden:
			exteriorPrompt.push(`It has a front garden`)
		case params.exterior?.terrace:
			exteriorPrompt.push(`It has a terrace`)
		case params.exterior?.balcony:
			exteriorPrompt.push(`It has a front garden`)
		case params.exterior?.car_port:
			exteriorPrompt.push(`It has a car port`)
		case params.exterior?.garage:
			if (params.exterior?.double_garage)
				exteriorPrompt.push(`It has a double garage`)
			else
				exteriorPrompt.push(`It has a garage`)
		case params.exterior?.storage_unit:
			exteriorPrompt.push(`It has a storage outbuilding`)
		case params.exterior?.outdoor_water:
			exteriorPrompt.push('It has an outdoor water tap')
		case params.exterior?.double_glazing:
			exteriorPrompt.push('It has double glazed windows')
		default:
		}

		switch (true) {
		case params.exterior?.onstreet_parking:
			exteriorPrompt.push(`It has a on-street parking available`)
			break
		case params.exterior?.offstreet_parking:
			exteriorPrompt.push(`It has a off-street parking`)
			break
		case params.exterior?.secure_parking:
			exteriorPrompt.push(`It has a dedicated secure parking`)
			break
		default:
		}

		const locationPrompt: string[] = [
			'The location can be described:',
		]

		switch (true) {
		case params.location?.commute_to_large_city:
			locationPrompt.push('It is ideally located for commuting')
		case params.location?.walk_to_station:
			locationPrompt.push('It is a short walk to the nearest station')
		case params.location?.walk_to_highstreet:
			locationPrompt.push('It is a short walk to the shops on the nearest high street')
		case params.location?.walk_to_pub:
			locationPrompt.push('It is a short walk to the local pub')
		case params.location?.walk_to_park:
			locationPrompt.push('It is a short walk to a local park')
		case params.location?.nearby_primary_school:
			locationPrompt.push('There is a primary school nearby')
		case params.location?.nearby_secondary_school:
			locationPrompt.push('There is a secondary school nearby')
		case params.location?.nearby_nature:
			locationPrompt.push('Surrounded by natural countryside')
		case params.location?.nearby_national_park:
			locationPrompt.push('It is nearby a national park')
		case params.location?.nearby_seaside:
			locationPrompt.push('It is near the coast and may be near beaches and seaside towns')
		default:
		}

		if (params.nearby_locations.length) {
			locationPrompt.push('The local places and ameneties nearby are:')
			locationPrompt.push(...params.nearby_locations.map(l => `${l.name} is a ${l.type} which is ${l.distance_km}km away;`))
			locationPrompt.push('Mention these places in the listing Do not mention any other nearby places other than these.')
		} else {
			locationPrompt.push('It it does not have any nearby ameneties but may be a short drive away from somewhere more populated.')
		}

		return [
			{ role: 'system', content: 'You are helpfully generating passages of text which will be published on a website.' },
			{ role: 'user', content: [
				...basePrompt,
				periodPrompt,
				...interiorPrompt,
				...exteriorPrompt,
				...locationPrompt,
			].join('\n') },
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
