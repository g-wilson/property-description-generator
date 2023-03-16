import { DefaultContext, Request } from 'koa'
import { RouterContext } from 'koa-router'
import createHttpError, { HttpError } from 'http-errors'
import FirebaseApp from 'firebase-admin/app'
import MongoDB from 'mongodb'
import bunyan from 'bunyan'
import openai from 'openai'

import { AccountServiceInterface } from '../../app/services/accounts/types.js'

export type AuthContext = {
	system: boolean
	userId: string
	phoneNumber: string | null
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

	getPhoneNumber() {
		if (!this.ctx.phoneNumber)
			throw createHttpError(403, 'missing_phone_number', { expose: true })

		return this.ctx.phoneNumber
	}

}

interface RequestWithBody<ReqBody> extends Request {
	body: ReqBody
}

export interface ServerDefaultContext extends DefaultContext {
	getFirebase: () => FirebaseApp.App
	getMongoDB: () => MongoDB.Db
	getAuth: () => AuthContextProvider
	getOpenAI: () => openai.OpenAIApi
	getAccountService: () => AccountServiceInterface
}

export interface ServerContext<ReqBody = object | void, ResBody = object | void> extends RouterContext, ServerDefaultContext {
	error?: HttpError
	request: RequestWithBody<ReqBody>
	body: ResBody
	log: bunyan
}
