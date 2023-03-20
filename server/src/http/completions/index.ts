import { DefaultState } from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'

import { ServerContext } from '../middleware/context.js'
import createAuthMiddleware from '../middleware/auth.js'
import requireOnboarding from '../middleware/require-onboarding.js'

import * as createCompletion from '../completions/create.js'
import * as listRecent from '../completions/list_recent.js'

const router = new Router<DefaultState, ServerContext>()

export default router

router.use(bodyParser())
router.use(createAuthMiddleware('firebase_or_apikey'))
router.use(requireOnboarding())

/**
 * UK Property Listing
 */
router.post('/uk_property_listing/create', createCompletion.schema, createCompletion.handler)
router.get('/uk_property_listing/recent', listRecent.schema, listRecent.handler)
