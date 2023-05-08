import { Client as GoogleMapsClient, Place } from '@googlemaps/google-maps-services-js'
import haversine from 'haversine-distance'
import createHttpError from 'http-errors'

import { PostcodesIOClient, ERROR_INVALID_POSTCODE } from '../../lib/postcodesio/index.js'
import { LatLon, NearbyLocation, LocationHelperInterface } from './types.js'

const SEARCH_RADIUS_PARKS = 1500
const SEARCH_RADIUS_PUBS = 900
const SEARCH_RADIUS_STATIONS = 2500

const errorInvalidPostcode = createHttpError(400, 'geocode_failed', { expose: true, description: 'Could not find a valid location with that UK postcode' })

export class LocationHelper implements LocationHelperInterface {

	private googleMapsAPIKey: string
	private postcodesioClient: PostcodesIOClient
	private googleMapsClient: GoogleMapsClient

	constructor(opts: { googleMapsAPIKey: string, postcodesio: PostcodesIOClient, googleMaps: GoogleMapsClient }) {
		this.googleMapsAPIKey = opts.googleMapsAPIKey
		this.googleMapsClient = opts.googleMaps
		this.postcodesioClient = opts.postcodesio
	}

	async geocodePostcode(postcode: string): Promise<LatLon> {
		try {
			const res = await this.postcodesioClient.lookup(postcode)

			if (res.latitude === null || res.longitude === null)
				throw errorInvalidPostcode

			return {
				lat: res.latitude,
				lon: res.longitude,
			}
		} catch (e) {
			if (e === errorInvalidPostcode)
				throw e

			if (e instanceof Error) {
				if (e.message === ERROR_INVALID_POSTCODE)
					throw errorInvalidPostcode
			}

			throw e
		}
	}

	async getNearbyLocations(location: LatLon): Promise<NearbyLocation[]> {
		const allPlaces = await Promise.all([
			this.getNearestStation(location),
			this.getNearestPub(location),
			this.getNearestPark(location),
		])

		return allPlaces.filter(Boolean) as NearbyLocation[]
	}

	private async getNearestStation(location: LatLon): Promise<NearbyLocation | null> {
		const res = await this.googleMapsClient.placesNearby({
			params: {
				key: this.googleMapsAPIKey,
				location: [ location.lat, location.lon ].join(','),
				radius: SEARCH_RADIUS_STATIONS,
				keyword: 'railway station',
			},
		})

		if (res.data.error_message)
			throw createHttpError(500, 'googlemaps_failure', { cause: res.data.error_message })

		if (!res.data.results.length)
			return null

		return toNearbyLocation(location, 'station', res.data.results[0])
	}

	private async getNearestPub(location: LatLon): Promise<NearbyLocation | null> {
		const res = await this.googleMapsClient.placesNearby({
			params: {
				key: this.googleMapsAPIKey,
				location: [ location.lat, location.lon ].join(','),
				radius: SEARCH_RADIUS_PUBS,
				keyword: 'pub',
			},
		})

		if (res.data.error_message)
			throw createHttpError(500, 'googlemaps_failure', { cause: res.data.error_message })

		if (!res.data.results.length)
			return null

		return toNearbyLocation(location, 'pub', res.data.results[0])
	}

	private async getNearestPark(location: LatLon): Promise<NearbyLocation | null> {
		const res = await this.googleMapsClient.placesNearby({
			params: {
				key: this.googleMapsAPIKey,
				location: [ location.lat, location.lon ].join(','),
				radius: SEARCH_RADIUS_PARKS,
				keyword: 'park or common',
			},
		})

		if (res.data.error_message)
			throw createHttpError(500, 'googlemaps_failure', { cause: res.data.error_message })

		if (!res.data.results.length)
			return null

		return toNearbyLocation(location, 'park', res.data.results[0])
	}

}

function toNearbyLocation(location: LatLon, type: string, place: Place): NearbyLocation {
	if (!place.geometry)
		throw new Error('place has no geometry')

	if (!place.name)
		throw new Error('place has no name')

	const placeLocation: LatLon = {
		lat: place.geometry?.location.lat,
		lon: place.geometry?.location.lng,
	}

	const distance = getDistance(location, placeLocation)

	return {
		type,
		name: place.name,
		distance_km: parseFloat((distance / 1000).toFixed(2)),
	}
}

function getDistance(placeA: LatLon, placeB: LatLon): number {
	return haversine(
		{ latitude: placeA.lat, longitude: placeA.lon },
		{ latitude: placeB.lat, longitude: placeB.lon },
	)
}
