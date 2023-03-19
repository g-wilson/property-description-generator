import { DefaultState } from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'

import { ServerContext } from '../middleware/context.js'
import createAuthMiddleware from '../middleware/auth.js'
import requireOnboarding from '../middleware/require-onboarding.js'

import * as start from './start.js'
import * as agreeTerms from './account/agree_terms.js'
import * as getAccount from './account/get_account.js'
import * as ukProperty from './completions/ukproperty.js'

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
router.get('/account/:account_id', getAccount.schema, getAccount.handler)
router.post('/account/:account_id/agree_terms', agreeTerms.schema, agreeTerms.handler)

/**
 * Onboarding required past this point
 */
router.use(requireOnboarding())

/**
 * Completions
 */
router.post('/create_completion/uk_property_listing', ukProperty.schema, ukProperty.handler)
