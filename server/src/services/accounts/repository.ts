import { MongoRepository } from '../../lib/mongo/index.js'
import { Account } from './types.js'
import { ulid } from 'ulid'
import { DateTime } from 'luxon'
import { ID_ENV_PREFIX } from '../../lib/service-context/index.js'

function generateAccountID(): string {
	return [
		ID_ENV_PREFIX,
		'acc',
		ulid(),
	].filter(Boolean).join('_')
}

export class AccountRepositoryMongo extends MongoRepository {

	async getById(accountId: string): Promise<Account | null> {
		return this.db.collection<Account>('accounts')
			.findOne({ _id: accountId })
	}

	async getByUserId(userId: string): Promise<Account | null> {
		return this.db.collection<Account>('accounts')
			.findOne({ users: [ userId ] })
	}

	async createOrUpdateAccountWithUserId(userId: string): Promise<void> {
		const newAccountId = generateAccountID()

		await this.db.collection<Account>('accounts')
			.updateOne({ users: [ userId ] }, {
				$set: {
					last_active_at: DateTime.fromJSDate(new Date()).toUTC().toBSON(),
					last_active_user: userId,
				},
				$setOnInsert: {
					_id: newAccountId,
					created_at: DateTime.fromJSDate(new Date()).toUTC().toBSON(),
					updated_at: DateTime.fromJSDate(new Date()).toUTC().toBSON(),
					terms_agreed_version: null,
					terms_agreed_at: null,
					terms_agreed_by: null,
					users: [ userId ],
				},
			}, { upsert: true })
	}

	async updateTerms(accountId: string, params: {
		termsVersion: string
		agreedBy: string
		agreedAt: Date
	}): Promise<void> {
		await this.db.collection<Account>('accounts')
			.updateOne({ _id: accountId }, {
				$set: {
					updated_at: DateTime.fromJSDate(new Date()).toUTC().toBSON(),
					terms_agreed_version: params.termsVersion,
					terms_agreed_at: params.agreedAt,
					terms_agreed_by: params.agreedBy,
				},
			}, { upsert: true })
	}

}
