/* eslint-disable no-console,no-process-exit */
import Koa from 'koa'
import Router from 'koa-router'
import env from 'require-env'
import openai from 'openai'
import { initializeApp, applicationDefault } from 'firebase-admin/app'

import { getMongoDatabase, getMongoClient } from '../lib/mongo/index.js'
import { ServerDefaultContext, ServerContext } from './middleware/context.js'
import status from './middleware/status.js'
import error from './middleware/error.js'
import notFound from './middleware/not-found.js'
import { logger, requestLogger } from './middleware/logger.js'
import v1routes from './v1/index.js'

import { AccountService } from '../app/services/accounts/service.js'
import { AccountRepositoryMongo } from '../app/services/accounts/repository.js'
import { CompletionService } from '../app/services/completions/index.js'
import { CompletionRepositoryMongo } from '../app/services/completions/repository.js'

async function init() {
	const server = new Koa<Koa.DefaultState, ServerDefaultContext>({ proxy: true })
	const router = new Router<Koa.DefaultState, ServerContext>()

	await attachDependencies(server.context)

	server.use(status())
	server.use(requestLogger())
	server.use(error())

	router.use('/v1', v1routes.middleware())

	server.use(router.middleware())

	server.use(notFound())

	return server
}

async function attachDependencies(ctx: ServerDefaultContext) {
	env.inherit('.env')

	logger.info('loaded environment')

	const firebase = await initializeApp({
		credential: applicationDefault(),
		projectId: env.require('FIREBASE_PROJECT_ID'),
	})

	logger.info('loaded firebase')

	const mongoClient = getMongoClient(env.require('MONGODB_CONNECTION_URI'))

	await mongoClient.connect()

	const mongodb = getMongoDatabase(mongoClient, env.require('MONGODB_DB_NAME'))

	await mongodb.command({ ping: 1 })

	logger.info('connected to mongo')

	const openaiClient = new openai.OpenAIApi(new openai.Configuration({
		apiKey: env.require('OPENAI_API_KEY'),
	}))

	const accountRepository = new AccountRepositoryMongo({ mongoClient, mongodb })
	const accountService = new AccountService({ repository: accountRepository })

	const completionRepository = new CompletionRepositoryMongo({ mongoClient, mongodb })
	const completionService = new CompletionService({ repository: completionRepository })

	ctx.getFirebase = () => firebase
	ctx.getMongoDB = () => mongodb
	ctx.getOpenAI = () => openaiClient
	ctx.getAccountService = () => accountService
	ctx.getCompletionService = () => completionService
}

try {
	const server = await init()

	server.listen(env.require('PORT'), () => {
		logger.info('booted')
	})
} catch (e) {
	if (e instanceof Error)
		logger.error({ error: e.message }, 'boot_failed')
}
