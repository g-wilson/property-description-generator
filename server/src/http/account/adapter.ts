import { APIKey } from '../../services/apikeys/types'

export type ListedAPIKey = {
	_id: string
	created_at: Date
	created_by: string
}

export function toReturnableAPIKey(key: APIKey): ListedAPIKey {
	return {
		_id: key._id,
		created_at: key.created_at,
		created_by: key.created_by,
	}
}
