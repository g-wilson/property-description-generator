import { ServerContext } from '../middleware/context.js'

type ExampleResponse = {
	message: string
}

export async function handler(ctx: ServerContext<void, ExampleResponse>) {
	ctx.body = { message: 'success' }
}
