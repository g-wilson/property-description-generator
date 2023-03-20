export interface Account {
	_id: string
	created_at: Date
	updated_at: Date
	last_active_at: Date
	last_active_user: string
	terms_agreed_version: string | null
	terms_agreed_at: Date | null
	terms_agreed_by: string | null
	users: string[]
}

export interface AccountServiceInterface {
	getById: (accountId: string) => Promise<Account>
	tryGetByUserId: (userId: string) => Promise<Account | null>
	ensureAccountForUser: (userId: string) => Promise<Account>
	checkTermsAgreed: (accountId: string) => Promise<void>
	agreeTerms: (accountId: string, termsVersion: string, agreedBy: string) => Promise<void>
}

export interface AccountRepository {
	getById: (accountId: string) => Promise<Account | null>
	getByUserId: (userId: string) => Promise<Account | null>
	createOrUpdateAccountWithUserId: (userId: string) => Promise<void>
	updateTerms: (accountId: string, params: {
		termsVersion: string
		agreedBy: string
		agreedAt: Date
	}) => Promise<void>
}
