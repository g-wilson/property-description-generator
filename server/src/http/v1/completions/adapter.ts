import { SuccessfulCompletion } from "../../../app/services/completions/types";

export type ListedCompletion = {
	created_at: Date
	response: string
}

export function toReturnableCompletion(cmpl: SuccessfulCompletion): ListedCompletion {
	return {
		created_at: cmpl.created_at,
		response: cmpl.response,
	}
}
