export interface APIKey {
	_id: string
	created_at: Date
	revoked_at: Date | null
	created_by: string
	account_id: string
	hashed_token: string
}

export interface APIKeyWithSecret {
	key: APIKey
	secret: string
}

export interface ApikeyServiceInterface {
	looksLikeToken(token: string): boolean
	getActiveByToken(token: string): Promise<APIKey>
	create(accountId: string, userId: string): Promise<APIKeyWithSecret>
	listActive(accountId: string): Promise<APIKey[]>
	revoke(keyId: string): Promise<void>
}

export interface ApikeyRepository {
	getActiveByHashedToken(hashedToken: string): Promise<APIKey>
	create(accountId: string, createdBy: string, hashedToken: string): Promise<APIKey>
	listActiveByAccount(accountId: string): Promise<APIKey[]>
	revoke(keyId: string): Promise<void>
}
