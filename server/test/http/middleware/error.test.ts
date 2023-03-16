import test from 'ava'
import createHttpError from 'http-errors'

import { mockContext } from '../../helpers/koa.js'
import createErrorMiddleware from '../../../src/http/middleware/error.js'
import { ErrorResponse } from '../../../src/http/types.js'
import { ServerContext } from '../../../src/http/middleware/context.js'

const mw = createErrorMiddleware()

test('throwing an exposed error returns it in the body', async t => {
	const next = async () => {
		throw createHttpError(500, 'thing_is_broken', { expose: true })
	}
	const ctx = mockContext() as ServerContext<void, ErrorResponse>

	await t.notThrowsAsync(() => mw(ctx, next))

	t.is(ctx.status, 500)
	t.is(ctx.body.message, 'thing_is_broken')
})

test('throwing an unexposed error returns generic error message in the body', async t => {
	const next = async () => {
		throw createHttpError(500, 'thing_not_found')
	}
	const ctx = mockContext() as ServerContext<void, ErrorResponse>

	await t.notThrowsAsync(() => mw(ctx, next))

	t.is(ctx.status, 500)
	t.is(ctx.body.message, 'request_failed')
})

test('description is passed through', async t => {
	const next = async () => {
		throw createHttpError(500, 'thing_is_broken', { expose: true, description: '1' })
	}
	const ctx = mockContext() as ServerContext<void, ErrorResponse>

	await t.notThrowsAsync(() => mw(ctx, next))

	t.is(ctx.status, 500)
	t.is(ctx.body.message, 'thing_is_broken')
	t.is(ctx.body.description, '1')
})

test('unhandled errors are formatted', async t => {
	const next = async () => {
		throw new TypeError('o no')
	}
	const ctx = mockContext() as ServerContext<void, ErrorResponse>

	await t.notThrowsAsync(() => mw(ctx, next))

	t.is(ctx.status, 500)
	t.is(ctx.body.message, 'request_failed')
})
