import { DefaultContext, Request } from 'koa'
import { RouterContext } from 'koa-router'
import { HttpError } from 'http-errors'
import { OAuth2Client } from 'google-auth-library'
import MongoDB from 'mongodb'
import bunyan from 'bunyan'

import { AuthContextProvider } from './auth.js'
import { AccountServiceInterface } from '../../services/accounts/types.js'
import { CompletionServiceInterface } from '../../services/completions/types.js'
import { ApikeyServiceInterface } from '../../services/apikeys/types.js'
import { FirebaseWrapper } from '../../lib/firebase/index.js'
import { UKPropertyService } from '../../services/ukproperty/index.js'

interface RequestWithBody<ReqBody> extends Request {
	body: ReqBody
}

export interface ServerDefaultContext extends DefaultContext {
	getFirebase: () => FirebaseWrapper
	getMongoDB: () => MongoDB.Db
	getGoogleOauthClient: () => OAuth2Client
	getAuth: () => AuthContextProvider
	getApikeyService: () => ApikeyServiceInterface
	getAccountService: () => AccountServiceInterface
	getCompletionService: ()=> CompletionServiceInterface
	getUKPropertyService: ()=> UKPropertyService
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ServerContext<ReqBody = any, ResBody = any> extends RouterContext, ServerDefaultContext {
	error?: HttpError
	request: RequestWithBody<ReqBody>
	body: ResBody
	log: bunyan
}
