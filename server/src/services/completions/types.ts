export enum Status {
	pending = 'pending',
	success = 'success',
	failed = 'failed',
}

export const COMPLETION_TYPES = {
	UK_PROPERTY_LISTING_V1: 'uk_property_listing_v1',
}

export interface OpenAIUsage {
	prompt_tokens: number
	completion_tokens: number
	total_tokens: number
}

export interface OpenAICompletionResult {
	latency: number
	response: string
	openai_completion_id: string
	openai_usage?: OpenAIUsage
}

export interface PendingCompletion {
	_id: string
	account_id: string
	user_id: string
	created_at: Date
	updated_at: Date
	type: string,
	status: Status
	params: Record<string, any>
}

interface SuccessfulCompletionFields {
	latency: number
	response: string
	openai_completion_id: string
	openai_usage: OpenAIUsage
}

interface FailedCompletionFields {
	failure_reason: string
}

export interface SuccessfulCompletion extends PendingCompletion, SuccessfulCompletionFields {}

export interface FailedCompletion extends PendingCompletion, FailedCompletionFields {}

export interface Completion extends PendingCompletion, SuccessfulCompletionFields, FailedCompletionFields {}

export type RepositoryUpdateParams = Partial<
	Pick<Completion, 'status' | 'response' | 'openai_usage' | 'openai_completion_id' | 'failure_reason'>
>

export type RepositoryCreateParams = Pick<Completion, 'user_id' | 'account_id' | 'status' | 'type' | 'params'>

export interface CompletionServiceInterface {
	createPending(accountId: string, userId: string, type: string, params: Record<string, any>): Promise<PendingCompletion>
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
