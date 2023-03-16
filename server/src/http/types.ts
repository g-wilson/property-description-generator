export const ErrMsg = {
	RequestFailed: 'request_failed',
	OutdatedClient: 'outdated_client',
	Unauthorized: 'unauthorized',
	AuthInvalid: 'invalid_auth_header',
	AccessDenied: 'access_denied',
	RouteNotFound: 'route_not_found',
	InvalidClientVersion: 'invalid_client_version',
} as const

export interface ErrorResponse {
	message: string
	description?: string
	cause?: string
}

export interface ValidationErrorResponse extends ErrorResponse {
	details: {
		message: string
		keyword: string
		dataPath: string
		schemaPath: string
		params: Record<string, string>
	}[]
}
