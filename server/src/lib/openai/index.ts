import {
	CreateChatCompletionRequest,
	CreateChatCompletionResponseChoicesInner,
	CreateCompletionResponseUsage,
	OpenAIApi,
} from 'openai'

import { getRequestLogger } from '../../lib/logger/index.js'

// must meet OpenAICompletionResult interface
export type ChatResponse = {
	latency: number
	response: string
	openai_completion_id: string
	openai_usage?: CreateCompletionResponseUsage
}

export class OpenAIChat {

	private openaiClient: OpenAIApi

	constructor(opts: { openai: OpenAIApi }) {
		this.openaiClient = opts.openai
	}

	async createChatCompletion(req: CreateChatCompletionRequest): Promise<ChatResponse> {
		const startTime = Date.now()
		const response = await this.openaiClient.createChatCompletion(req)
		const latency = (Date.now() - startTime)

		const responseMessage = response.data.choices[0]?.message?.content ?? ''
		if (!responseMessage)
			throw new Error('chat_response_message_missing')

		getRequestLogger().info('openai_completion_success', {
			latency,
			openai_completion_id: response.data.id,
			openai_usage: response.data.usage,
		})

		return {
			latency,
			response: responseMessage,
			openai_completion_id: response.data.id,
			openai_usage: response.data.usage,
		}
	}

}
