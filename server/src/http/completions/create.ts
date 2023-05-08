import { middleware as jsonschema } from 'koa-json-schema'

import { UKPropertyListingPromptParams } from '../../services/ukproperty/types.js'
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
				'barn',
				'conversion',
				'farmhouse',
				'cottage',
				'manor',
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
		character: {
			type: 'object',
			additionalProperties: false,
			required: [ 'new_build', 'period' ],
			properties: {
				new_build: {
					type: 'boolean',
				},
				period: {
					type: 'boolean',
				},
				modern: {
					type: 'boolean',
				},
				georgian: {
					type: 'boolean',
				},
				edwardian: {
					type: 'boolean',
				},
				victorian: {
					type: 'boolean',
				},
				twenties: {
					type: 'boolean',
				},
				thirties: {
					type: 'boolean',
				},
				forties: {
					type: 'boolean',
				},
				fifties: {
					type: 'boolean',
				},
				sixties: {
					type: 'boolean',
				},
				seventies: {
					type: 'boolean',
				},
				eighties: {
					type: 'boolean',
				},
				nineties: {
					type: 'boolean',
				},
			},
		},

		interior: {
			type: 'object',
			additionalProperties: false,
			properties: {
				dated: {
					type: 'boolean',
				},
				needs_renovation: {
					type: 'boolean',
				},
				modern: {
					type: 'boolean',
				},
				modern_kitchen: {
					type: 'boolean',
				},
				modern_bathroom: {
					type: 'boolean',
				},
				recent_renovation: {
					type: 'boolean',
				},
				open_plan_living: {
					type: 'boolean',
				},
				kitchen_dining: {
					type: 'boolean',
				},
				ensuite_master: {
					type: 'boolean',
				},
				multiple_ensuite: {
					type: 'boolean',
				},
				utility_room: {
					type: 'boolean',
				},
				annexe: {
					type: 'boolean',
				},
				stone_floor: {
					type: 'boolean',
				},
				wood_floor: {
					type: 'boolean',
				},
				tiled_floor: {
					type: 'boolean',
				},
			},
		},

		exterior: {
			type: 'object',
			additionalProperties: false,
			properties: {
				land_acres: {
					type: 'number',
				},
				garden_acres: {
					type: 'number',
				},
				garden: {
					type: 'boolean',
				},
				front_garden: {
					type: 'boolean',
				},
				terrace: {
					type: 'boolean',
				},
				balcony: {
					type: 'boolean',
				},
				car_port: {
					type: 'boolean',
				},
				garage: {
					type: 'boolean',
				},
				double_garage: {
					type: 'boolean',
				},
				onstreet_parking: {
					type: 'boolean',
				},
				offstreet_parking: {
					type: 'boolean',
				},
				secure_parking: {
					type: 'boolean',
				},
				storage_unit: {
					type: 'boolean',
				},
				outdoor_water: {
					type: 'boolean',
				},
				double_glazing: {
					type: 'boolean',
				},
			},
		},

		location: {
			type: 'object',
			additionalProperties: false,
			properties: {
				commute_to_large_city: {
					type: 'boolean',
				},
				walk_to_station: {
					type: 'boolean',
				},
				walk_to_highstreet: {
					type: 'boolean',
				},
				walk_to_pub: {
					type: 'boolean',
				},
				walk_to_park: {
					type: 'boolean',
				},
				nearby_primary_school: {
					type: 'boolean',
				},
				nearby_secondary_school: {
					type: 'boolean',
				},
				nearby_nature: {
					type: 'boolean',
				},
				nearby_national_park: {
					type: 'boolean',
				},
				nearby_seaside: {
					type: 'boolean',
				},
			},
		},
	},
})

type UKPropertyListingRequest = UKPropertyListingPromptParams

type UKPropertyListingResponse = {
	description: string
}

export async function handler(ctx: ServerContext<UKPropertyListingRequest, UKPropertyListingResponse>) {
	const auth = ctx.getAuth()
	const ukProperty = ctx.getUKPropertyService()
	const params = ctx.request.body

	const response = await ukProperty.generateDescription(auth.getAccount(), auth.getUser(), params)

	ctx.body = { description: response }
}
