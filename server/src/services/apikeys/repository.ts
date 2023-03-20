import createHttpError from 'http-errors'
import { DateTime } from 'luxon'
import { ulid } from 'ulid'

import { APIKey, ApikeyRepository } from './types.js'
import { MongoRepository } from '../../lib/mongo/index.js'
import { ID_ENV_PREFIX } from '../../lib/service-context/index.js'

function generateApikeyId(): string {
	return [
		ID_ENV_PREFIX,
		'apikey',
		ulid(),
	].filter(Boolean).join('_')
}

export class ApikeyRepositoryMongo extends MongoRepository implements ApikeyRepository {

	async getActiveByHashedToken(hashedToken: string): Promise<APIKey> {
		const key = await this.db.collection<APIKey>('apikeys')
			.findOne({
				hashed_token: hashedToken,
				revoked_at: null,
			})

		if (!key)
			throw createHttpError(404, 'apikey_not_found', { expose: true })

		return key
	}

	async create(accountId: string, createdBy: string, hashedToken: string): Promise<APIKey> {
		const newKeyId = generateApikeyId()

		const key: APIKey = {
			_id: newKeyId,
			created_at: DateTime.fromJSDate(new Date()).toUTC().toBSON(),
			created_by: createdBy,
			revoked_at: null,
			account_id: accountId,
			hashed_token: hashedToken,
		}

		await this.db.collection<APIKey>('apikeys')
			.insertOne(key as APIKey)

		return key
	}

	async listActiveByAccount(accountId: string): Promise<APIKey[]> {
		return await this.db.collection<APIKey>('apikeys')
			.find({
				account_id: accountId,
				revoked_at: null,
			})
			.sort('created_at', -1)
			.limit(50)
			.toArray()
	}

	async revoke(keyId: string): Promise<void> {
		const updatedAt = DateTime.fromJSDate(new Date()).toUTC().toBSON()

		await this.db.collection<APIKey>('apikeys')
			.updateOne({ _id: keyId }, {
				$set: {
					updated_at: updatedAt,
					revoked_at: updatedAt,
				},
			}, { upsert: true })
	}

}
