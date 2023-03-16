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

	t.context = {
		user,
		api,
		// serverProcess,
	}
})

// test.after(async t => {
// 	t.context.serverProcess.kill()
// })

test.serial('api: status', async t => {
	const { api } = t.context

	await t.notThrowsAsync(() => api.get('/'))
})

test.serial('api: start fails', async t => {
	const { api } = t.context

	const e = await t.throwsAsync(() => api.post('/v1/start', {}))

	t.is(e?.message, 'terms_not_agreed')
})

test.serial('api: agree terms', async t => {
	const { api } = t.context

	await t.notThrowsAsync(() => api.post('/v1/agree_terms', { terms_version: '2023-03-16' }))
})

test.serial('api: start', async t => {
	const { api } = t.context

	await t.notThrowsAsync(() => api.post('/v1/start', {}))
})

test.serial('api: example authenticated endpoint succeeds', async t => {
	const { api } = t.context

	const res = await api.get('/v1/example')

	t.is(res?.data.message, 'success')
})
