import { DefaultState, Middleware, Next } from 'koa'
import createHttpError from 'http-errors'
import { getAuth } from 'firebase-admin/auth'
import { OAuth2Client } from 'google-auth-library'

import { AuthContext, AuthContextProvider, ServerContext } from '../middleware/context.js'
import { ErrMsg } from '../types.js'
import { IS_TEST, IS_DEVELOPMENT, FIREBASE_PROJECT_ID, SYSTEM_SERVICE_ACCOUNT, ID_ENV_PREFIX } from '../../lib/service-context/index.js'

const canUseResolverOverride = ((IS_TEST || IS_DEVELOPMENT) && process.env.AUTH_RESOLVER) // eslint-disable-line no-process-env
const authResolverOverride = canUseResolverOverride ? process.env.AUTH_RESOLVER : undefined // eslint-disable-line no-process-env

const authClient = new OAuth2Client()

type ResolverFn = (ctx: ServerContext, authToken: string) => Promise<AuthContext>

const resolvers: Record<string, ResolverFn> = {
	gcp: googleCloudResolver,
	firebase: firebaseResolver,
	mock: mockResolver,
}

export default function createAuthMiddleware(resolver: string): Middleware<DefaultState, ServerContext> {
	const resolverFn = resolvers[authResolverOverride ?? resolver]

	return async (ctx: ServerContext, next: Next) => {
		const authToken = ctx.headers.authorization?.split('Bearer ').pop()
		if (!authToken)
			throw createHttpError(401, ErrMsg.AuthInvalid, { expose: true })

		try {
			const authCtx = await resolverFn(ctx, authToken)
			const authCtxProvider = new AuthContextProvider(authCtx)

			ctx.log.fields.auth_user_id = authCtx.userId

			ctx.getAuth = () => authCtxProvider
		} catch (e) {
			if (e instanceof Error)
				throw createHttpError(401, ErrMsg.Unauthorized, { expose: true, cause: e.message })
		}

		await next()
	}
}

async function firebaseResolver(ctx: ServerContext, authToken: string): Promise<AuthContext> {
	const firebaseApp = ctx.getFirebase()
	const accountService = ctx.getAccountService()
	let accountId = null

	const idToken = await getAuth(firebaseApp).verifyIdToken(authToken)
	const userId = normaliseUserId(idToken.sub)
	const phoneNumber = idToken.phone_number || null

	const acc = await accountService.tryGetByUserId(userId)
	if (acc)
		accountId = acc._id

	return {
		system: false,
		userId,
		phoneNumber,
		accountId,
	}
}

async function googleCloudResolver(ctx: ServerContext, authToken: string): Promise<AuthContext> {
	const serviceAccountToken = await authClient.verifyIdToken({
		idToken: authToken,
		audience: FIREBASE_PROJECT_ID,
	})

	const claims = serviceAccountToken.getPayload()
	if (!claims?.email)
		throw new Error('google auth token email is not present')

	if (claims?.email_verified !== true)
		throw new Error('google auth token email is not verified')

	if (claims?.email !== SYSTEM_SERVICE_ACCOUNT)
		throw new Error('google auth token email does not match system service account')

	return {
		system: true,
		userId: 'system',
		accountId: null,
		phoneNumber: null,
	}
}

async function mockResolver(ctx: ServerContext, authToken: string): Promise<AuthContext> {
	const fromToken = JSON.parse(authToken)

	if (!fromToken.userId)
		throw new Error('userId is required in mock token')

	const userId = normaliseUserId(fromToken.userId)
	const phoneNumber = fromToken.phoneNumber || null
	let accountId = null

	const accountService = ctx.getAccountService()
	const acc = await accountService.tryGetByUserId(userId)
	if (acc)
		accountId = acc._id

	return {
		system: false,
		phoneNumber,
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
