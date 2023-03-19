import createHttpError from 'http-errors'
import {
	CompletionRepository,
	CompletionServiceInterface,
	Status,
	PendingCompletion,
	SuccessfulCompletion,
	OpenAICompletionResult,
	OpenAICreateCompletionParams,
	COMPLETION_TYPES,
} from './types.js'

export class CompletionService implements CompletionServiceInterface {

	private repo: CompletionRepository

	constructor(opts: { repository: CompletionRepository }) {
		this.repo = opts.repository
	}

	async createPending(accountId: string, userId: string, type: string, params: OpenAICreateCompletionParams): Promise<PendingCompletion> {
		return await this.repo.create({
			user_id: userId,
			account_id: accountId,
			status: Status.pending,
			type,
			openai_params: params,
		})
	}

	async updateSuccess(completionId: string, result: OpenAICompletionResult): Promise<void> {
		await this.repo.update(completionId, {
			status: Status.success,
			...result,
		})
	}

	async updateFailed(completionId: string, reason: string): Promise<void> {
		await this.repo.update(completionId, {
			status: Status.failed,
			failure_reason: reason,
		})
	}

	async listRecentForAccount(accountId: string, type: string, limit: number): Promise<SuccessfulCompletion[]> {
		if (limit > 25)
			throw createHttpError(400, 'limit_too_high', { expose: true, description: 'Max limit is 25' })

		if (!Object.values(COMPLETION_TYPES).includes(type))
			throw createHttpError(500, 'invalid_completion_type')

		return this.repo.listRecentForAccount(accountId, type, limit)
	}

}
