import { DefaultState } from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'

import { ServerContext } from '../middleware/context.js'
import createAuthMiddleware from '../middleware/auth.js'
import requireOnboarding from '../middleware/require-onboarding.js'

import * as start from './start.js'
import * as agreeTerms from './agree_terms.js'
import * as example from './example.js'

const router = new Router<DefaultState, ServerContext>()

export default router

router.use(bodyParser())
router.use(createAuthMiddleware('firebase'))

/**
 * User first-run
 */
router.post('/start', start.handler)
router.post('/agree_terms', agreeTerms.schema, agreeTerms.handler)

/**
 * Onboarding required past this point
 */
router.use(requireOnboarding())

/**
 * Playing for now
 */
router.get('/example', example.handler)
