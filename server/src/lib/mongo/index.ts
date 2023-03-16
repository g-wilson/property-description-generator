import {
	Db,
	MongoClient,
	ReadConcernLevel,
	ReadPreference,
	ReadPreferenceMode,
	TransactionOptions,
	WithTransactionCallback,
} from 'mongodb'

export function getMongoClient(connUri: string): MongoClient {
	return new MongoClient(connUri, {
		ssl: true,
		authSource: 'admin',
		maxPoolSize: 20,
		readConcernLevel: ReadConcernLevel.majority,
		w: 'majority',
		retryWrites: true,
		retryReads: true,
		ignoreUndefined: true,
	})
}

export function getMongoDatabase(mongoClient: MongoClient, dbName: string): Db {
	return mongoClient.db(dbName)
}

const defaultTransactionOptions: TransactionOptions = {
	readPreference: new ReadPreference(ReadPreferenceMode.primary),
	readConcern: { level: ReadConcernLevel.snapshot },
	writeConcern: { w: 'majority' },
	retryWrites: true,
	maxTimeMS: 2000,
	maxCommitTimeMS: 1000,
}

export type MongoRepositoryArgs = { mongoClient: MongoClient, mongodb: Db }

export class MongoRepository {

	private mongoClient: MongoClient
	protected db: Db

	constructor(opts: MongoRepositoryArgs) {
		this.mongoClient = opts.mongoClient
		this.db = opts.mongodb
	}

	protected async doTx<T>(callback: WithTransactionCallback<T>, opts?: TransactionOptions) {
		// support nested calls:
		// if there is already a session with a transaction, run the callback straight away
		// passing through the parent session+transaction
		if (opts?.session && opts.session.transaction)
			return await callback(opts?.session)

		const session = this.mongoClient.startSession()

		// workaround for this issue:
		// https://jira.mongodb.org/browse/NODE-2014
		let callbackRes: T

		return session.withTransaction(async () => {
			callbackRes = await callback(session)
		}, {
			...defaultTransactionOptions,
			...opts,
		}).then(() => callbackRes)
	}

}
