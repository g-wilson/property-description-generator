import { MongoRepository } from '../../../lib/mongo/index.js'
import { Completion, CompletionRepository } from './types.js'
import { ulid } from 'ulid'
import { DateTime } from 'luxon'
import { ID_ENV_PREFIX } from '../../../lib/service-context/index.js'
import createHttpError from 'http-errors'

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

	async create(params: Omit<Completion, '_id' | 'created_at' | 'updated_at'>): Promise<Completion> {
		const newCompletionId = generateCompletionId()

		const cmpl: Completion = {
			_id: newCompletionId,
			created_at: DateTime.fromJSDate(new Date()).toUTC().toBSON(),
			updated_at: DateTime.fromJSDate(new Date()).toUTC().toBSON(),
			...params,
		}

		await this.db.collection<Completion>('completions')
			.insertOne(cmpl)

		return cmpl
	}

	async update(completionId: string, params: Omit<Completion, '_id' | 'created_at' | 'updated_at'>): Promise<void> {
		await this.db.collection<Completion>('completions')
			.updateOne({ _id: completionId }, {
				$set: {
					updated_at: DateTime.fromJSDate(new Date()).toUTC().toBSON(),
					...params,
				},
			}, { upsert: true })
	}

}
