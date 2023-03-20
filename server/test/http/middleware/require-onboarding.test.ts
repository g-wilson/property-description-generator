import test from 'ava'
import sinon from 'sinon'
import createHttpError from 'http-errors'

import { mockContext } from '../../helpers/koa.js'
import { AuthContextProvider } from '../../../src/http/middleware/auth.js'
import { ServerContext } from '../../../src/http/middleware/context.js'
import { AccountServiceInterface } from '../../../src/services/accounts/types.js'

import createRequireOnboardingMiddleware from '../../../src/http/middleware/require-onboarding.js'

const mw = createRequireOnboardingMiddleware()

test('errors when no account created', async t => {
	const next = sinon.spy()
	const ctx = mockContext() as ServerContext

	ctx.getAuth = () => new AuthContextProvider({
		userId: 'usr_1',
		system: false,
		accountId: null,
	})

	ctx.getAccountService = () => ({}) as unknown as AccountServiceInterface

	const e = await t.throwsAsync(() => mw(ctx, next))

	t.is(e?.message, 'missing_account')
	t.falsy(next.calledOnce)
})

test('errors when terms not agreed', async t => {
	const next = sinon.spy()
	const ctx = mockContext() as ServerContext

	ctx.getAuth = () => new AuthContextProvider({
		userId: 'usr_1',
		system: false,
		accountId: 'acc_1',
	})

	ctx.getAccountService = () => ({
		checkTermsAgreed: () => Promise.reject(createHttpError(403, 'terms_not_agreed')),
	}) as unknown as AccountServiceInterface

	const e = await t.throwsAsync(() => mw(ctx, next))

	t.is(e?.message, 'terms_not_agreed')
	t.falsy(next.calledOnce)
})

test('passes', async t => {
	const next = sinon.spy()
	const ctx = mockContext() as ServerContext

	ctx.getAuth = () => new AuthContextProvider({
		userId: 'usr_1',
		system: false,
		accountId: 'acc_1',
	})

	ctx.getAccountService = () => ({
		checkTermsAgreed: () => Promise.resolve(true),
	}) as unknown as AccountServiceInterface

	await t.notThrowsAsync(() => mw(ctx, next))

	t.truthy(next.calledOnce)
})
