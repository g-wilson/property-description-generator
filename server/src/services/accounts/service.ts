import createHttpError from 'http-errors'
import { Account, AccountServiceInterface, AccountRepository } from './types.js'

const LATEST_REQUIRED_TERMS_VERSION = '2023-03-16'

export class AccountService implements AccountServiceInterface {

	private repo: AccountRepository

	constructor(opts: { repository: AccountRepository }) {
		this.repo = opts.repository
	}

	async getById(accountId: string): Promise<Account> {
		const acc = await this.repo.getById(accountId)
		if (!acc)
			throw createHttpError(403, 'account_not_found', { expose: true })

		return acc
	}

	async tryGetByUserId(userId: string): Promise<Account | null> {
		return await this.repo.getByUserId(userId)
	}

	async ensureAccountForUser(userId: string): Promise<Account> {
		await this.repo.createOrUpdateAccountWithUserId(userId)

		const acc = await this.repo.getByUserId(userId)

		if (!acc)
			throw new Error('ensureAccountForUser: could not retrieve created account')

		return acc
	}

	async checkTermsAgreed(accountId: string): Promise<void> {
		const acc = await this.getById(accountId)

		if (!acc.terms_agreed_version || acc.terms_agreed_version !== LATEST_REQUIRED_TERMS_VERSION)
			throw createHttpError(403, 'terms_not_agreed', { expose: true })
	}

	async agreeTerms(accountId: string, termsVersion: string, agreedBy: string): Promise<void> {
		await this.repo.updateTerms(accountId, {
			termsVersion,
			agreedBy,
			agreedAt: new Date(),
		})
	}

}
