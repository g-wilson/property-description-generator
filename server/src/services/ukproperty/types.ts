import { CreateChatCompletionRequest } from 'openai'

import { OpenAICompletionResult } from '../completions/types.js'

export interface AIChatCompletor {
	createChatCompletion(req: CreateChatCompletionRequest): Promise<OpenAICompletionResult>
}

export interface NearbyLocation {
	type: string
	name: string
	distance_km: number
}

export interface LatLon {
	lat: number
	lon: number
}

export interface LocationHelperInterface {
	geocodePostcode(postcode: string): Promise<LatLon>
	getNearbyLocations(location: LatLon): Promise<NearbyLocation[]>
}

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
	utility_room?: boolean
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
	nearby_locations: NearbyLocation[]
	character?: UKPropertyListingCharacter
	interior?: UKPropertyListingInterior
	exterior?: UKPropertyListingExterior
	location?: UKPropertyListingLocation
}
