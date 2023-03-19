export enum Status {
	pending = 'pending',
	success = 'success',
	failed = 'failed',
}

export const COMPLETION_TYPES = {
	UK_PROPERTY_LISTING_V1: 'uk_property_listing_v1'
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
	response: string
	openai_completion_id: string
	openai_usage?: OpenAIUsage
	openai_choices?: OpenAIChoice[]
}

export interface PendingCompletion {
	_id: string
	account_id: string
	user_id: string
	created_at: Date
	updated_at: Date
	type: string,
	status: Status
}

interface SuccessfulCompletionFields {
	latency: number
	response: string
	openai_completion_id: string
	openai_params: OpenAICreateCompletionParams
	openai_usage: OpenAIUsage
	openai_choices: OpenAIChoice[]
}

interface FailedCompletionFields {
	failure_reason: string
}

export interface SuccessfulCompletion extends PendingCompletion, SuccessfulCompletionFields {}

export interface FailedCompletion extends PendingCompletion, FailedCompletionFields {}

export interface Completion extends PendingCompletion, SuccessfulCompletionFields, FailedCompletionFields {}

export type RepositoryUpdateParams = Partial<Pick<Completion, 'status' | 'response' | 'openai_usage' | 'openai_choices' | 'openai_completion_id' | 'failure_reason'>>

export type RepositoryCreateParams = Pick<Completion, 'user_id' | 'account_id' | 'status' | 'type' | 'openai_params'>

export interface CompletionServiceInterface {
	createPending(accountId: string, userId: string, type: string, params: OpenAICreateCompletionParams): Promise<PendingCompletion>
	updateSuccess(completionId: string, result: OpenAICompletionResult): Promise<void>
	updateFailed(completionId: string, reason: string): Promise<void>
	listRecentForAccount(accountId: string, type: string, limit: number): Promise<SuccessfulCompletion[]>
}

export interface CompletionRepository {
	get(completionId: string): Promise<Completion>
	create(params: RepositoryCreateParams): Promise<PendingCompletion>
	update(completionId: string, params: RepositoryUpdateParams): Promise<void>
	listRecentForAccount(accountId: string, type: string, limit: number): Promise<SuccessfulCompletion[]>
}
