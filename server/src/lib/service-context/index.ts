/* eslint-disable no-process-env */
import env from 'require-env'

env.inherit('.env')

export const IS_DEVELOPMENT = (env.require('NODE_ENV') === 'development')

export const IS_TEST = (env.require('NODE_ENV') === 'test')

// defaults so test env doesn't require .env file
if (IS_TEST && !process.env.FIREBASE_PROJECT_ID)
	process.env.FIREBASE_PROJECT_ID = '__placeholder__'

export const FIREBASE_PROJECT_ID = env.require('FIREBASE_PROJECT_ID')

export const IS_GCLOUD = Boolean(process.env.K_SERVICE)

export const SYSTEM_SERVICE_ACCOUNT = IS_GCLOUD ? `${process.env.K_SERVICE}@${FIREBASE_PROJECT_ID}.iam.gserviceaccount.com` : '__placeholder__'

export const COMPONENT_NAME = IS_GCLOUD && process.env.K_SERVICE ? process.env.K_SERVICE : `${FIREBASE_PROJECT_ID}-local`

export const ID_ENV_PREFIX = ((): string => {
	if (IS_DEVELOPMENT)
		return 'dev'

	if (IS_TEST)
		return 'test'

	if (IS_GCLOUD && process.env.ID_ENV_PREFIX)
		return process.env.ID_ENV_PREFIX

	return ''
})()
