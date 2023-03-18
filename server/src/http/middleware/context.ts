import { DefaultContext, Request } from 'koa'
import { RouterContext } from 'koa-router'
import { HttpError } from 'http-errors'
import FirebaseApp from 'firebase-admin/app'
import MongoDB from 'mongodb'
import bunyan from 'bunyan'
import openai from 'openai'

import { AuthContextProvider } from './auth.js'
import { AccountServiceInterface } from '../../app/services/accounts/types.js'
import { CompletionServiceInterface } from '../../app/services/completions/types.js'

interface RequestWithBody<ReqBody> extends Request {
	body: ReqBody
}

export interface ServerDefaultContext extends DefaultContext {
	getFirebase: () => FirebaseApp.App
	getMongoDB: () => MongoDB.Db
	getAuth: () => AuthContextProvider
	getOpenAI: () => openai.OpenAIApi
	getAccountService: () => AccountServiceInterface
	getCompletionService: ()=> CompletionServiceInterface
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ServerContext<ReqBody = any, ResBody = any> extends RouterContext, ServerDefaultContext {
	error?: HttpError
	request: RequestWithBody<ReqBody>
	body: ResBody
	log: bunyan
}
