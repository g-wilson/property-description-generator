import test from 'ava'
import createHttpError from 'http-errors'

import { mockContext } from '../../helpers/koa.js'
import { ServerContext, AuthContextProvider } from '../../../src/http/middleware/context.js'
import { AccountServiceInterface, Account } from '../../../src/app/services/accounts/types.js'

import { handler } from '../../../src/http/v1/start.js'

test('errors when terms not agreed', async t => {
	const ctx = mockContext() as ServerContext

	ctx.getAuth = () => new AuthContextProvider({
		userId: 'usr_1',
		system: false,
		phoneNumber: '+1111111111',
		accountId: null,
	})

	ctx.getAccountService = () => ({
		ensureAccountForUser(userId: string): Promise<Account> {
			return Promise.resolve({
				_id: 'acc_1',
				created_at: new Date(),
				updated_at: new Date(),
				last_active_at: new Date(),
				last_active_user: 'usr_1',
				terms_agreed_version: null,
				terms_agreed_at: null,
				terms_agreed_by: null,
				users: [ userId ],
			} as Account)
		},
		checkTermsAgreed: () => Promise.reject(createHttpError(403, 'terms_not_agreed')),
	}) as unknown as AccountServiceInterface

	const e = await t.throwsAsync(() => handler(ctx))

	t.is(e?.message, 'terms_not_agreed')
})

test('passes', async t => {
	const ctx = mockContext() as ServerContext

	ctx.getAuth = () => new AuthContextProvider({
		userId: 'usr_1',
		system: false,
		phoneNumber: '+1111111111',
		accountId: null,
	})

	ctx.getAccountService = () => ({
		ensureAccountForUser(userId: string): Promise<Account> {
			return Promise.resolve({
				_id: 'acc_1',
				created_at: new Date(),
				updated_at: new Date(),
				last_active_at: new Date(),
				last_active_user: 'usr_1',
				terms_agreed_version: '2023-03-16',
				terms_agreed_at: new Date(),
				terms_agreed_by: 'usr_1',
				users: [ userId ],
			} as Account)
		},
		checkTermsAgreed: () => Promise.resolve(),
	}) as unknown as AccountServiceInterface

	await t.notThrowsAsync(() => handler(ctx))
})
