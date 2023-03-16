import { ServerContext } from '../middleware/context'

export async function handler(ctx: ServerContext) {
	ctx.body = { message: 'success' }
}
