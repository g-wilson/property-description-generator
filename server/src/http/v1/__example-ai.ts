// export async function handler(ctx: ServerContext<void, ExampleResponse>) {
// 	const auth = ctx.getAuth()
// 	const openai = ctx.getOpenAI()

// 	const response = await openai.createCompletion({
// 		user: auth.getUser(),
// 		model: 'gpt-3.5-turbo',
// 		// suffix: '|||',
// 		max_tokens: 512,
// 		// temperature: 1,
// 		// top_p: 1,
// 		prompt: `Write a description for a property listing`,
// 	})

// 	ctx.log.info('openai-response', response.data)

// 	const responseMessage = response.data.choices[0]?.text ?? ''
// 	if (!responseMessage)
// 		createHttpError(500, 'no_response')

// 	ctx.body = { message: responseMessage }
// }
