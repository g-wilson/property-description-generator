/* eslint-disable no-param-reassign */
import test from 'ava'
import env from 'require-env'
import { Client as GoogleMapsClient } from '@googlemaps/google-maps-services-js'

import { PostcodesIOClient } from '../../src/lib/postcodesio/index.js'
import { LocationHelper } from '../../src/services/ukproperty/location.js'

test.before(async () => {
	env.inherit('.env')
})

test('location: can geocode a uk postcode', async t => {
	const locationsClient = new LocationHelper({
		googleMapsAPIKey: env.require('GOOGLE_MAPS_API_KEY'),
		postcodesio: new PostcodesIOClient(),
		googleMaps: new GoogleMapsClient({}),
	})

	const geocodeRes = await locationsClient.geocodePostcode('E1 7JF')

	t.truthy(geocodeRes.lat)
	t.truthy(geocodeRes.lon)
})

test('location: can find nearby places', async t => {
	const locationsClient = new LocationHelper({
		googleMapsAPIKey: env.require('GOOGLE_MAPS_API_KEY'),
		postcodesio: new PostcodesIOClient(),
		googleMaps: new GoogleMapsClient({}),
	})

	const nearbyRes = await locationsClient.getNearbyLocations({
		lat: 51.518199,
		lon: -0.078037,
	})

	t.truthy(nearbyRes[0])
})
