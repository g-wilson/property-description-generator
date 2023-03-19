/* eslint-disable no-param-reassign */
import ava, { TestFn } from 'ava'
import { ChildProcess } from 'child_process'
import env from 'require-env'

import { getMongoClient, getMongoDatabase } from '../../src/lib/mongo/index.js'
import {
	APIHelper,
	// createTestAPIServer,
} from './_utils.js'

type TestUser = { userId: string, phoneNumber: string }

interface TestContext {
	user: TestUser
	api: APIHelper
	serverProcess?: ChildProcess
	account_id?: string
}

export const test = ava as TestFn<TestContext>

test.before(async t => {
	env.inherit('.env')

	const mongoClient = getMongoClient(env.require('MONGODB_CONNECTION_URI'))

	await mongoClient.connect()

	const mongodb = getMongoDatabase(mongoClient, env.require('MONGODB_DB_NAME'))

	await mongodb.command({ ping: 1 })
	await mongodb.collection('accounts').deleteMany({ users: 'dev_usr_622f7c16fc13ae6e690001a5' })

	// you can launch the API in testenv mode
	// const serverProcess = await createTestAPIServer()

	// you can send "authenticated" requests to it
	const user = { userId: '622f7c16fc13ae6e690001a5', phoneNumber: '+19000000002' }
	const api = new APIHelper('http://localhost:3000', JSON.stringify(user))

	// check status
	await t.notThrowsAsync(() => api.get('/'))

	// provision user and account for testing
	const startRes = await api.post('/v1/start', {})

	t.context = {
		user,
		api,
		account_id: startRes?.data.account_id
		// serverProcess,
	}
})

// test.after(async t => {
// 	t.context.serverProcess.kill()
// })

test.serial('api: get account fails with other account', async t => {
	const { api } = t.context

	const e = await t.throwsAsync(() => api.get(`/v1/account/dev_acc_AADSFGAG713`))

	t.is(e?.message, 'account_not_found')
})

test.serial('api: get account succeeds with own account', async t => {
	const { api, account_id } = t.context

	const res = await api.get(`/v1/account/${account_id}`)

	t.truthy(res?.data.id)
	t.falsy(res?.data.terms_agreed_at)
})

test.serial('api: fails if terms not agreed', async t => {
	const { api } = t.context

	const e = await t.throwsAsync(() => api.get('/v1/completions/uk_property_listing/recent'))

	t.is(e?.message, 'terms_not_agreed')
})

test.serial('api: agree terms', async t => {
	const { api, account_id } = t.context

	await t.notThrowsAsync(() => api.post(`/v1/account/${account_id}/agree_terms`, { terms_version: '2023-03-16' }))

	const res = await api.get(`/v1/account/${account_id}`)

	t.truthy(res?.data.terms_agreed_at)
})

test.serial('api: list completions', async t => {
	const { api } = t.context

	const res = await api.get('/v1/completions/uk_property_listing/recent?limit=2')

	t.deepEqual(res?.data.completions, [])
})

test.serial.skip('api: completion succeeds', async t => {
	const { api } = t.context

	const res = await api.post('/v1/completions/uk_property_listing/create', {
		postcode: 'EC1R 0HA',
		property_type: 'flat',
		floors: 1,
		bedrooms: 2,
		bathrooms: 1,
	})

	t.truthy(res?.data.description)
})
