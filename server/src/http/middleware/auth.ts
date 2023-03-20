import { DefaultState, Middleware, Next } from 'koa'
import createHttpError from 'http-errors'

import { ServerContext } from '../middleware/context.js'
import { ErrMsg } from '../types.js'
import { IS_DEVELOPMENT, FIREBASE_PROJECT_ID, ID_ENV_PREFIX, COMPONENT_NAME } from '../../lib/service-context/index.js'

const canUseResolverOverride = (IS_DEVELOPMENT && process.env.AUTH_RESOLVER) // eslint-disable-line no-process-env
const authResolverOverride = canUseResolverOverride ? process.env.AUTH_RESOLVER : undefined // eslint-disable-line no-process-env

export type AuthContext = {
	system: boolean
	userId: string
	accountId: string | null
}

export class AuthContextProvider {

	ctx: AuthContext

	constructor(ctx: AuthContext) {
		this.ctx = ctx
	}

	getUser() {
		return this.ctx.userId
	}

	getAccount() {
		if (!this.ctx.accountId)
			throw createHttpError(403, 'missing_account', { expose: true })

		return this.ctx.accountId
	}

}

type ResolverFn = (ctx: ServerContext, authToken: string) => Promise<AuthContext>

const resolvers: Record<string, ResolverFn> = {
	gcp: googleCloudResolver,
	firebase: firebaseResolver,
	apikey: apikeyResolver,
	firebase_or_apikey: firebaseOrApikeyResolver,
	mock: mockResolver,
}

export default function createAuthMiddleware(resolver: string): Middleware<DefaultState, ServerContext> {
	const resolverFn = resolvers[authResolverOverride ?? resolver]
	if (!resolverFn)
		throw new Error('auth: resolver not found')

	return async (ctx: ServerContext, next: Next) => {
		const authToken = ctx.headers.authorization?.split('Bearer ').pop()
		if (!authToken)
			throw createHttpError(401, ErrMsg.AuthInvalid, { expose: true })

		try {
			const authCtx = await resolverFn(ctx, authToken)
			const authCtxProvider = new AuthContextProvider(authCtx)

			ctx.getAuth = () => authCtxProvider
		} catch (e) {
			if (e instanceof Error)
				throw createHttpError(401, ErrMsg.Unauthorized, { expose: true, cause: e.message })
			else
				throw createHttpError(401, ErrMsg.Unauthorized, { expose: true })
		}

		await next()
	}
}

async function firebaseResolver(ctx: ServerContext, authToken: string): Promise<AuthContext> {
	const firebaseApp = ctx.getFirebase()
	const accountService = ctx.getAccountService()
	let accountId = null
	let idToken

	try {
		idToken = await firebaseApp.verifyIdToken(authToken)
	} catch (e) {
		throw createHttpError(401, 'invalid_id_token', { expose: true })
	}

	if (!idToken.phone_number)
		throw createHttpError(401, 'missing_phone_number', { expose: true })

	const userId = normaliseUserId(idToken.sub)
	const acc = await accountService.tryGetByUserId(userId)
	if (acc)
		accountId = acc._id

	return {
		system: false,
		userId,
		accountId,
	}
}

async function apikeyResolver(ctx: ServerContext, authToken: string): Promise<AuthContext> {
	const apikeyService = ctx.getApikeyService()

	if (!apikeyService.looksLikeToken(authToken))
		throw new Error('auth: invalid api key format')

	const apiKey = await apikeyService.getActiveByToken(authToken)

	return {
		system: false,
		userId: apiKey._id,
		accountId: apiKey.account_id,
	}
}

async function firebaseOrApikeyResolver(ctx: ServerContext, authToken: string): Promise<AuthContext> {
	const apikeyService = ctx.getApikeyService()

	if (apikeyService.looksLikeToken(authToken))
		return apikeyResolver(ctx, authToken)

	return firebaseResolver(ctx, authToken)
}

async function googleCloudResolver(ctx: ServerContext, authToken: string): Promise<AuthContext> {
	const authClient = ctx.getGoogleOauthClient()

	const serviceAccountToken = await authClient.verifyIdToken({
		idToken: authToken,
		audience: FIREBASE_PROJECT_ID,
	})

	const claims = serviceAccountToken.getPayload()
	if (!claims?.email)
		throw new Error('google auth token email is not present')

	if (claims?.email_verified !== true)
		throw new Error('google auth token email is not verified')

	const expectedServiceAccount = `${COMPONENT_NAME}@${FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`

	if (claims?.email !== expectedServiceAccount)
		throw new Error('google auth token email does not match system service account')

	return {
		system: true,
		userId: 'system',
		accountId: null,
	}
}

async function mockResolver(ctx: ServerContext, authToken: string): Promise<AuthContext> {
	let mockObj

	try {
		mockObj = JSON.parse(authToken)
	} catch (e) {
		throw new Error('invalid json in mock token')
	}

	if (!mockObj.userId)
		throw new Error('userId is required in mock token')

	const userId = normaliseUserId(mockObj.userId)
	let accountId = null

	const accountService = ctx.getAccountService()
	const acc = await accountService.tryGetByUserId(userId)
	if (acc)
		accountId = acc._id

	return {
		system: false,
		userId,
		accountId,
	}
}

function normaliseUserId(providerUserId: string): string {
	return [
		ID_ENV_PREFIX,
		'usr',
		providerUserId,
	].filter(Boolean).join('_')
}
