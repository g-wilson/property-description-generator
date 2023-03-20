/* eslint-disable no-console,no-process-exit */
import Koa from 'koa'
import Router from 'koa-router'
import env from 'require-env'
import openai from 'openai'
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { OAuth2Client } from 'google-auth-library'

import { getMongoDatabase, getMongoClient } from '../lib/mongo/index.js'
import { logger, createMiddleware as createRequestLogMiddleware } from '../lib/logger/index.js'
import { ServerDefaultContext, ServerContext } from './middleware/context.js'
import status from './middleware/status.js'
import error from './middleware/error.js'
import notFound from './middleware/not-found.js'

import accountRoutes from './account/index.js'
import completionsRoutes from './completions/index.js'

import { AccountService } from '../services/accounts/service.js'
import { AccountRepositoryMongo } from '../services/accounts/repository.js'
import { CompletionService } from '../services/completions/index.js'
import { CompletionRepositoryMongo } from '../services/completions/repository.js'
import { FirebaseWrapper } from '../lib/firebase/index.js'

async function init() {
	const server = new Koa<Koa.DefaultState, ServerDefaultContext>({ proxy: true })
	const router = new Router<Koa.DefaultState, ServerContext>()

	await attachDependencies(server.context)

	server.use(status())
	server.use(createRequestLogMiddleware())
	server.use(error())

	router.use('/account', accountRoutes.middleware())
	router.use('/completions', completionsRoutes.middleware())

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

	ctx.getFirebase = () => new FirebaseWrapper(firebase)
	ctx.getMongoDB = () => mongodb
	ctx.getGoogleOauthClient = () => new OAuth2Client()
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
