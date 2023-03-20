import test from 'ava'
import { OAuth2Client } from 'google-auth-library'
import sinon from 'sinon'
import { DecodedIdToken } from 'firebase-admin/auth'

import { mockContext } from '../../helpers/koa.js'
import createAuthMiddleware from '../../../src/http/middleware/auth.js'
import { ServerContext } from '../../../src/http/middleware/context.js'
import { ApikeyServiceInterface } from '../../../src/services/apikeys/types.js'
import { AccountServiceInterface } from '../../../src/services/accounts/types.js'
import { FirebaseWrapper } from '../../../src/lib/firebase/index.js'
import { COMPONENT_NAME, FIREBASE_PROJECT_ID } from '../../../src/lib/service-context/index.js'

test('middleware: errors when no header is provided', async t => {
	const next = sinon.spy()
	const ctx = mockContext() as ServerContext

	const mw = createAuthMiddleware('firebase')
	const e = await t.throwsAsync(() => mw(ctx, next))

	t.is(e?.message, 'invalid_auth_header')
	t.falsy(next.calledOnce)
})

test('firebase: errors with invalid token', async t => {
	const next = sinon.spy()
	const ctx = mockContext({
		headers: {
			authorization: 'Bearer aaajowijvowi9envoeivn',
		},
	}) as ServerContext

	ctx.getFirebase = () => ({
		async verifyIdToken() {
			throw new Error('blah')
		},
	}) as unknown as FirebaseWrapper

	const mw = createAuthMiddleware('firebase')
	const e = await t.throwsAsync(() => mw(ctx, next))

	t.is(e?.message, 'unauthorized')
	t.falsy(next.calledOnce)
})

test('firebase: fails with valid token but no phone number', async t => {
	const next = sinon.spy()
	const ctx = mockContext({
		headers: {
			authorization: 'Bearer aaajowijvowi9envoeivn',
		},
	}) as ServerContext

	ctx.getFirebase = () => ({
		async verifyIdToken() {
			return {
				sub: 'abc123',
			} as DecodedIdToken
		},
	}) as unknown as FirebaseWrapper

	ctx.getAccountService = () => ({
		async tryGetByUserId() {
			return Promise.resolve(null)
		},
	}) as unknown as AccountServiceInterface

	const mw = createAuthMiddleware('firebase')
	const e = await t.throwsAsync(() => mw(ctx, next))

	t.is(e?.message, 'unauthorized')
	t.is(e?.cause, 'missing_phone_number')
	t.falsy(next.calledOnce)
})

test('firebase: succeeds with valid token and phone number', async t => {
	const next = sinon.spy()
	const ctx = mockContext({
		headers: {
			authorization: 'Bearer aaajowijvowi9envoeivn',
		},
	}) as ServerContext

	ctx.getFirebase = () => ({
		async verifyIdToken() {
			return {
				sub: 'abc123',
				phone_number: '+4471111111',
			} as DecodedIdToken
		},
	}) as unknown as FirebaseWrapper

	ctx.getAccountService = () => ({
		async tryGetByUserId() {
			return Promise.resolve(null)
		},
	}) as unknown as AccountServiceInterface

	const mw = createAuthMiddleware('firebase')

	await t.notThrowsAsync(() => mw(ctx, next))

	const a = ctx.getAuth()

	t.is(a.ctx.userId, 'test_usr_abc123')

	t.truthy(next.calledOnce)
})

test('firebase: succeeds with valid token and phone number and matching account', async t => {
	const next = sinon.spy()
	const ctx = mockContext({
		headers: {
			authorization: 'Bearer aaajowijvowi9envoeivn',
		},
	}) as ServerContext

	ctx.getFirebase = () => ({
		async verifyIdToken() {
			return {
				sub: 'abc123',
				phone_number: '+4471111111',
			} as DecodedIdToken
		},
	}) as unknown as FirebaseWrapper

	ctx.getAccountService = () => ({
		async tryGetByUserId() {
			return Promise.resolve({
				_id: 'test_acc_09AFG',
			})
		},
	}) as unknown as AccountServiceInterface

	const mw = createAuthMiddleware('firebase')

	await t.notThrowsAsync(() => mw(ctx, next))

	const a = ctx.getAuth()

	t.is(a.ctx.userId, 'test_usr_abc123')
	t.is(a.ctx.accountId, 'test_acc_09AFG')

	t.truthy(next.calledOnce)
})

test('apikey: errors with invalid token', async t => {
	const next = sinon.spy()
	const ctx = mockContext({
		headers: {
			authorization: 'Bearer aaajowijvowi9envoeivn',
		},
	}) as ServerContext

	ctx.getApikeyService = () => ({
		looksLikeToken() {
			return false
		},
	}) as unknown as ApikeyServiceInterface

	const mw = createAuthMiddleware('apikey')
	const e = await t.throwsAsync(() => mw(ctx, next))

	t.is(e?.message, 'unauthorized')
	t.falsy(next.calledOnce)
})

test('apikey: succeeds with valid token', async t => {
	const next = sinon.spy()
	const ctx = mockContext({
		headers: {
			authorization: 'Bearer test_sk_013FSGA',
		},
	}) as ServerContext

	ctx.getApikeyService = () => ({
		looksLikeToken() {
			return true
		},
		async getActiveByToken() {
			return Promise.resolve({
				_id: 'test_apikey_ALXAWE',
				account_id: 'test_acc_09AFG',
			})
		},
	}) as unknown as ApikeyServiceInterface

	const mw = createAuthMiddleware('apikey')

	await t.notThrowsAsync(() => mw(ctx, next))

	const a = ctx.getAuth()

	t.is(a.ctx.accountId, 'test_acc_09AFG')
	t.is(a.ctx.userId, 'test_apikey_ALXAWE')

	t.truthy(next.calledOnce)
})

test('firebase_or_apikey: fails with invalid token', async t => {
	const next = sinon.spy()
	const ctx = mockContext({
		headers: {
			authorization: 'Bearer asdfasdfasdfasdf',
		},
	}) as ServerContext

	ctx.getApikeyService = () => ({
		looksLikeToken() {
			return false
		},
	}) as unknown as ApikeyServiceInterface

	const mw = createAuthMiddleware('firebase_or_apikey')
	const e = await t.throwsAsync(() => mw(ctx, next))

	t.is(e?.message, 'unauthorized')
	t.falsy(next.calledOnce)
})

test('firebase_or_apikey: succeeds with valid apikey token', async t => {
	const next = sinon.spy()
	const ctx = mockContext({
		headers: {
			authorization: 'Bearer test_sk_013FSGA',
		},
	}) as ServerContext

	ctx.getApikeyService = () => ({
		looksLikeToken() {
			return true
		},
		async getActiveByToken() {
			return Promise.resolve({
				_id: 'test_apikey_ALXAWE',
				account_id: 'test_acc_09AFG',
			})
		},
	}) as unknown as ApikeyServiceInterface

	const mw = createAuthMiddleware('firebase_or_apikey')

	await t.notThrowsAsync(() => mw(ctx, next))

	const a = ctx.getAuth()

	t.is(a.ctx.accountId, 'test_acc_09AFG')
	t.is(a.ctx.userId, 'test_apikey_ALXAWE')

	t.truthy(next.calledOnce)
})

test('gcp: fails with invalid token', async t => {
	const next = sinon.spy()

	const ctx = mockContext({
		headers: {
			authorization: 'Bearer aaaaaaaaaaaaa',
		},
	}) as ServerContext

	ctx.getGoogleOauthClient = () => ({
		async verifyIdToken() {
			throw new Error('invalid token')
		},
	}) as unknown as OAuth2Client

	const mw = createAuthMiddleware('gcp')

	const e = await t.throwsAsync(() => mw(ctx, next))

	t.is(e?.message, 'unauthorized')
	t.falsy(next.calledOnce)
})

test('gcp: fails with missing email', async t => {
	const next = sinon.spy()

	const ctx = mockContext({
		headers: {
			authorization: 'Bearer aaaaaaaaaaaaa',
		},
	}) as ServerContext

	ctx.getGoogleOauthClient = () => ({
		async verifyIdToken() {
			return Promise.resolve({
				getPayload: () => ({}),
			})
		},
	}) as unknown as OAuth2Client

	const mw = createAuthMiddleware('gcp')

	const e = await t.throwsAsync(() => mw(ctx, next))

	t.is(e?.message, 'unauthorized')
	t.falsy(next.calledOnce)
})

test('gcp: fails with unverified email', async t => {
	const next = sinon.spy()

	const ctx = mockContext({
		headers: {
			authorization: 'Bearer aaaaaaaaaaaaa',
		},
	}) as ServerContext

	ctx.getGoogleOauthClient = () => ({
		async verifyIdToken() {
			return Promise.resolve({
				getPayload: () => ({
					email: 'test@googlecloud.com',
					email_verified: false,
				}),
			})
		},
	}) as unknown as OAuth2Client

	const mw = createAuthMiddleware('gcp')

	const e = await t.throwsAsync(() => mw(ctx, next))

	t.is(e?.message, 'unauthorized')
	t.falsy(next.calledOnce)
})

test('gcp: fails with incorrect email address', async t => {
	const next = sinon.spy()

	const ctx = mockContext({
		headers: {
			authorization: 'Bearer aaaaaaaaaaaaa',
		},
	}) as ServerContext

	ctx.getGoogleOauthClient = () => ({
		async verifyIdToken() {
			return Promise.resolve({
				getPayload: () => ({
					email: 'test@googlecloud.com',
					email_verified: true,
				}),
			})
		},
	}) as unknown as OAuth2Client

	const mw = createAuthMiddleware('gcp')

	const e = await t.throwsAsync(() => mw(ctx, next))

	t.is(e?.message, 'unauthorized')
	t.falsy(next.calledOnce)
})

test('gcp: succeeds with valid token', async t => {
	const next = sinon.spy()

	const ctx = mockContext({
		headers: {
			authorization: 'Bearer aaaaaaaaaaaaa',
		},
	}) as ServerContext

	ctx.getGoogleOauthClient = () => ({
		async verifyIdToken() {
			return Promise.resolve({
				getPayload: () => ({
					email: `${COMPONENT_NAME}@${FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
					email_verified: true,
				}),
			})
		},
	}) as unknown as OAuth2Client

	const mw = createAuthMiddleware('gcp')

	await t.notThrowsAsync(() => mw(ctx, next))

	const a = ctx.getAuth()

	t.is(a.ctx.accountId, null)
	t.is(a.ctx.userId, 'system')
	t.is(a.ctx.system, true)

	t.truthy(next.calledOnce)
})

test('mock: succeeds with valid token', async t => {
	const next = sinon.spy()

	const jsonToken = JSON.stringify({
		userId: 'gqegedgsegs',
	})

	const ctx = mockContext({
		headers: {
			authorization: `Bearer ${jsonToken}`,
		},
	}) as ServerContext

	ctx.getAccountService = () => ({
		async tryGetByUserId() {
			return Promise.resolve(null)
		},
	}) as unknown as AccountServiceInterface

	const mw = createAuthMiddleware('mock')

	await t.notThrowsAsync(() => mw(ctx, next))

	const a = ctx.getAuth()

	t.is(a.ctx.accountId, null)
	t.is(a.ctx.userId, 'test_usr_gqegedgsegs')

	t.truthy(next.calledOnce)
})

test('mock: succeeds with valid token and matching account', async t => {
	const next = sinon.spy()

	const jsonToken = JSON.stringify({
		userId: 'gqegedgsegs',
	})

	const ctx = mockContext({
		headers: {
			authorization: `Bearer ${jsonToken}`,
		},
	}) as ServerContext

	ctx.getAccountService = () => ({
		async tryGetByUserId() {
			return Promise.resolve({
				_id: 'test_acc_09AFG',
			})
		},
	}) as unknown as AccountServiceInterface

	const mw = createAuthMiddleware('mock')

	await t.notThrowsAsync(() => mw(ctx, next))

	const a = ctx.getAuth()

	t.is(a.ctx.accountId, 'test_acc_09AFG')
	t.is(a.ctx.userId, 'test_usr_gqegedgsegs')

	t.truthy(next.calledOnce)
})
