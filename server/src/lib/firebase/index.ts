import { App } from 'firebase-admin/app'
import { DecodedIdToken, getAuth } from 'firebase-admin/auth'

export class FirebaseWrapper {

	private app: App

	constructor(app: App) {
		this.app = app
	}

	getApp(): App {
		return this.app
	}

	async verifyIdToken(authToken: string): Promise<DecodedIdToken> {
		return await getAuth(this.app).verifyIdToken(authToken)
	}

}
