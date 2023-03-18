import {
	CompletionRepository,
	CompletionServiceInterface,
	Status,
	Completion,
	OpenAICompletionResult,
	OpenAICreateCompletionParams,
} from './types.js'

export class CompletionService implements CompletionServiceInterface {

	private repo: CompletionRepository

	constructor(opts: { repository: CompletionRepository }) {
		this.repo = opts.repository
	}

	async createPending(accountId: string, userId: string, params: OpenAICreateCompletionParams): Promise<Completion> {
		return await this.repo.create({
			user_id: userId,
			account_id: accountId,
			status: Status.pending,
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

}
