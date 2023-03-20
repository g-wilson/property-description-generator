import { ulid } from 'ulid'
import { DateTime } from 'luxon'
import createHttpError from 'http-errors'

import {
	Completion,
	CompletionRepository,
	PendingCompletion,
	RepositoryCreateParams,
	RepositoryUpdateParams,
	Status,
	SuccessfulCompletion,
} from './types.js'
import { MongoRepository } from '../../lib/mongo/index.js'
import { ID_ENV_PREFIX } from '../../lib/service-context/index.js'

function generateCompletionId(): string {
	return [
		ID_ENV_PREFIX,
		'cmpl',
		ulid(),
	].filter(Boolean).join('_')
}

export class CompletionRepositoryMongo extends MongoRepository implements CompletionRepository {

	async get(completionId: string): Promise<Completion> {
		const cmpl = await this.db.collection<Completion>('completions')
			.findOne({ _id: completionId })

		if (!cmpl)
			throw createHttpError(404, 'completion_not_found', { expose: true })

		return cmpl
	}

	async create(params: RepositoryCreateParams): Promise<PendingCompletion> {
		const newCompletionId = generateCompletionId()

		const cmpl: PendingCompletion = {
			_id: newCompletionId,
			created_at: DateTime.fromJSDate(new Date()).toUTC().toBSON(),
			updated_at: DateTime.fromJSDate(new Date()).toUTC().toBSON(),
			...params,
		}

		await this.db.collection<Completion>('completions')
			.insertOne(cmpl as Completion)

		return cmpl
	}

	async update(completionId: string, params: RepositoryUpdateParams): Promise<void> {
		await this.db.collection<Completion>('completions')
			.updateOne({ _id: completionId }, {
				$set: {
					updated_at: DateTime.fromJSDate(new Date()).toUTC().toBSON(),
					...params,
				},
			}, { upsert: true })
	}

	async listRecentForAccount(accountId: string, type: string, limit: number): Promise<SuccessfulCompletion[]> {
		return await this.db.collection<Completion>('completions')
			.find({
				account_id: accountId,
				status: Status.success,
				type,
			})
			.sort('created_at', -1)
			.limit(limit)
			.toArray() as SuccessfulCompletion[]
	}

}
