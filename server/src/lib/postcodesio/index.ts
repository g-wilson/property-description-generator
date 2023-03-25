import axios, { Axios, AxiosResponse } from 'axios'

export const ERROR_INVALID_POSTCODE = 'PostcodesIOClient: invalid postcode'

export type LookupResponse = {
	status: number
	result: LookupResult
}

export type LookupResult = {
	postcode: string
	quality: number
	eastings: number | null
	northings: number | null
	country: string
	nhs_ha: string | null
	longitude: number | null
	latitude: number | null
	european_electoral_region: string | null
	primary_care_trust: string | null
	region: string | null
	lsoa: string | null
	msoa: string | null
	incode: string
	outcode: string
	parliamentary_constituency: string | null
	admin_district: string
	parish: string | null
	admin_county: string | null
	date_of_introduction: string
	admin_ward: string | null
	ced: string | null
	ccg: string | null
	nuts: string | null
	pfa: string | null
	codes: Codes
}

export interface Codes {
	admin_district: string | null
	admin_county: string | null
	admin_ward: string | null
	parish: string | null
	parliamentary_constituency: string | null
	ccg: string | null
	ccg_id: string | null
	ced: string | null
	nuts: string | null
	lsoa: string | null
	msoa: string | null
	lau2: string | null
	pfa: string | null
}

export class PostcodesIOClient {

	private axios: Axios

	constructor(axiosInstance?: Axios) {
		if (axiosInstance) {
			this.axios = axiosInstance
		} else {
			this.axios = axios.create()
		}
	}

	async lookup(postcode: string): Promise<LookupResult> {
		let res: AxiosResponse<LookupResponse>
		try {
			res = await this.axios.get<LookupResponse>(`https://api.postcodes.io/postcodes/${postcode}`)
		} catch {
			throw new Error('PostcodesIOClient: failed to reach postcodes.io')
		}

		if (res.status === 404)
			throw new Error(ERROR_INVALID_POSTCODE)

		if (res.status !== 200 || res.data.status !== 200)
			throw new Error(`PostcodesIOClient: postcodes.io returned status ${res.status}`)

		return res.data.result
	}

}
