// This file is copied from the Shopfy jest-koa-mocks lib
// but I removed the dependency on Jest
// https://github.com/Shopify/quilt/blob/e75680e669f696f8284d1de1615f7c9083275fe8/packages/jest-koa-mocks/src/create-mock-context/create-mock-context.ts

/* eslint-disable no-empty-function,@typescript-eslint/no-empty-function,@typescript-eslint/ban-types  */
import { URL } from 'url'
import stream from 'stream'
import httpMocks, { RequestMethod } from 'node-mocks-http'
import Koa, { Context } from 'koa'
import { RouterContext } from 'koa-router'

export interface Dictionary<T> {
	[key: string]: T;
}

export interface MockContext extends RouterContext {
	request: Context['request'] & {
		body?: any;
		rawBody?: string;
		session?: any;
	};
}

export interface Options<
	RequestBody = undefined,
> {
	url?: string
	method?: RequestMethod
	statusCode?: number
	session?: Dictionary<any>
	headers?: Dictionary<string>
	cookies?: Dictionary<string>
	state?: Dictionary<any>
	encrypted?: boolean
	host?: string
	requestBody?: RequestBody
	rawBody?: string
	throw?: Function
	redirect?: Function
	params?: Dictionary<string>
}

export function mockContext<
	RequestBody = undefined,
>(options: Options<RequestBody> = {}) {
	const app = new Koa()

	const {
		method,
		statusCode,
		session,
		requestBody,
		rawBody = '',
		url = '',
		host = 'test.com',
		encrypted = false,
		throw: throwFn = () => {},
		redirect = () => {},
		headers = {},
		state = {},
		params = {},
	} = options

	const extensions = {
		throw: throwFn,
		session,
		redirect,
		state,
	}

	const protocolFallback = encrypted ? 'https' : 'http'
	const urlObject = new URL(url, `${protocolFallback}://${host}`)

	const req = httpMocks.createRequest({
		url: urlObject.toString(),
		method,
		statusCode,
		session,
		headers: {
			// Koa determines protocol based on the `Host` header.
			Host: urlObject.host,
			...headers,
		},
	})

	// Some functions we call in the implementations will perform checks for `req.encrypted`, which delegates to the socket.
	// MockRequest doesn't set a fake socket itself, so we create one here.
	req.socket = new stream.Duplex() as any
	Object.defineProperty(req.socket, 'encrypted', {
		writable: false,
		value: urlObject.protocol === 'https:',
	})

	const res = httpMocks.createResponse()

	// Koa sets a default status code of 404, not the node default of 200
	// https://github.com/koajs/koa/blob/master/docs/api/response.md#responsestatus
	res.statusCode = 404

	// This is to get around an odd behavior in the `cookies` library, where if `res.set` is defined, it will use an internal
	// node function to set headers, which results in them being set in the wrong place.

	res.set = undefined as any

	const context = app.createContext(req, res) as MockContext

	Object.assign(context, extensions)

	// ctx.request.body is a common enough custom property for middleware to add that it's handy to just support it by default
	context.request.body = requestBody
	context.request.rawBody = rawBody
	context.params = params

	return context as Context
}
