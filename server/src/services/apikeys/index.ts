import { createHash, randomUUID } from 'crypto'

import { APIKey, APIKeyWithSecret, ApikeyRepository, ApikeyServiceInterface } from './types.js'
import { ID_ENV_PREFIX } from '../../lib/service-context/index.js'

export class ApikeyService implements ApikeyServiceInterface {

	private repo: ApikeyRepository

	constructor(opts: { repository: ApikeyRepository }) {
		this.repo = opts.repository
	}

	looksLikeToken(authToken: string): boolean {
		const parts = authToken.split('_')

		switch (true) {
		case parts.length === 2 && parts[0] === 'sk':
			return true
		case parts.length === 3 && parts[0] === ID_ENV_PREFIX && parts[1] === 'sk':
			return true
		default:
			return false
		}
	}

	async getActiveByToken(token: string): Promise<APIKey> {
		const hashedToken = this.hashSecret(token)

		return await this.repo.getActiveByHashedToken(hashedToken)
	}

	async create(accountId: string, userId: string): Promise<APIKeyWithSecret> {
		const secret = this.generateSecret()
		const hashedToken = this.hashSecret(secret)

		const key = await this.repo.create(accountId, userId, hashedToken)

		return { key, secret }
	}

	async listActive(accountId: string): Promise<APIKey[]> {
		return await this.repo.listActiveByAccount(accountId)
	}

	async revoke(keyId: string): Promise<void> {
		return this.repo.revoke(keyId)
	}

	private generateSecret(): string {
		return [
			ID_ENV_PREFIX,
			'sk',
			randomUUID(),
		].filter(Boolean).join('_')
	}

	private hashSecret(token: string): string {
		return createHash('sha256').update(token).digest('base64')
	}

}
