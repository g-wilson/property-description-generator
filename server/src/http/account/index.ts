import { DefaultState } from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'

import { ServerContext } from '../middleware/context.js'
import createAuthMiddleware from '../middleware/auth.js'

import * as start from './start.js'
import * as agreeTerms from './agree_terms.js'
import * as getAccount from './get_account.js'

const router = new Router<DefaultState, ServerContext>()

export default router

router.use(bodyParser())
router.use(createAuthMiddleware('firebase'))

/**
 * Client session first-run
 */
router.post('/start', start.handler)

/**
 * Account management
 */
router.get('/:account_id', getAccount.schema, getAccount.handler)
router.post('/:account_id/agree_terms', agreeTerms.schema, agreeTerms.handler)

/**
 * API Keys
 */
// router.get('/:account_id/api_keys', listApiKeys.schema, listApiKeys.handler)
// router.post('/:account_id/create_api_key', createApiKey.schema, createApiKey.handler)
// router.post('/:account_id/revoke_api_key', revokeApiKey.schema, revokeApiKey.handler)
