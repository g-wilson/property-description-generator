import test from 'ava'
import sinon from 'sinon'

import { mockContext } from '../../helpers/koa.js'
import createAuthMiddleware from '../../../src/http/middleware/auth.js'
import { ServerContext } from '../../../src/http/middleware/context.js'

const mw = createAuthMiddleware('firebase')

test('errors when no header is provided', async t => {
	const next = sinon.spy()
	const ctx = mockContext() as ServerContext

	const e = await t.throwsAsync(() => mw(ctx, next))

	t.is(e?.message, 'invalid_auth_header')
	t.falsy(next.calledOnce)
})

test('errors with invalid token', async t => {
	const next = sinon.spy()
	const ctx = mockContext({
		headers: {
			authorization: 'Bearer eylkfjowijvowi9envoeivn',
		},
	}) as ServerContext

	const e = await t.throwsAsync(() => mw(ctx, next))

	t.is(e?.message, 'unauthorized')
	t.falsy(next.calledOnce)
})
