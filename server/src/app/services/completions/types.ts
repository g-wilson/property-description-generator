export enum Status {
	pending = 'pending',
	success = 'success',
	failed = 'failed',
}

export type OpenAIChoice = Record<string, any>

export type OpenAICreateCompletionParams = Record<string, any>

export type OpenAIUsage = {
	prompt_tokens: number
	completion_tokens: number
	total_tokens: number
}

export type OpenAICompletionResult = {
	latency: number
	openai_completion_id: string
	openai_usage?: OpenAIUsage
	openai_choices?: OpenAIChoice[]
}

export interface Completion {
	_id: string
	account_id: string
	user_id: string
	created_at: Date
	updated_at: Date
	status: Status
	failure_reason?: string
	latency?: number
	openai_completion_id?: string
	openai_params?: OpenAICreateCompletionParams
	openai_usage?: OpenAIUsage
	openai_choices?: OpenAIChoice[]
}

export interface CompletionServiceInterface {
	createPending(accountId: string, userId: string, params: OpenAICreateCompletionParams): Promise<Completion>
	updateSuccess(completionId: string, result: OpenAICompletionResult): Promise<void>
	updateFailed(completionId: string, reason: string): Promise<void>
}

export interface CompletionRepository {
	get(completionId: string): Promise<Completion>
	create(params: Pick<Completion, 'user_id' | 'account_id' | 'status' | 'openai_params'>): Promise<Completion>
	update(
		completionId: string,
		params: Pick<Completion, 'status' | 'openai_usage' | 'openai_choices' | 'openai_completion_id' | 'failure_reason'>
	): Promise<void>
}
