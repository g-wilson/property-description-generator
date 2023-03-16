import { ChildProcess, fork } from 'child_process'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

export class APIHelper {

	#baseURL: string
	#authToken: string

	constructor(baseURL: string, authToken: string) {
		this.#baseURL = baseURL
		this.#authToken = authToken
	}

	_mapResponseErr(e: any) {
		if (e.response && e.response.data)
			throw new Error(e.response.data.message)

		throw new Error(e.message)
	}

	async post(path: string, body: any): Promise<void | AxiosResponse> {
		return await axios.post(`${this.#baseURL}${path}`, body, {
			headers: {
				authorization: `Bearer ${this.#authToken}`,
			},
		})
			.catch(this._mapResponseErr)
	}

	async get(path: string, options: AxiosRequestConfig = {}): Promise<void | AxiosResponse> {
		return await axios.get(`${this.#baseURL}${path}`, {
			...options,
			headers: {
				authorization: `Bearer ${this.#authToken}`,
				...options.headers,
			},
		})
			.catch(this._mapResponseErr)
	}

}

export async function createTestAPIServer(): Promise<ChildProcess> {
	const serverProcess = fork('src/http/index.js', [ 'child' ], {
		stdio: 'pipe',
		env: {
			NODE_ENV: 'test',
			AUTH_RESOLVER: 'mock',
		},
	})

	let hasBooted = false

	serverProcess.stdout?.on('data', (line: Buffer) => {
		if (line.toString().slice(0, 1) === '{') {
			const decoded = JSON.parse(line.toString())

			if (decoded.msg === 'booted')
				hasBooted = true

			if (decoded.level >= 50)
				console.log(decoded) // eslint-disable-line
		} else {
			console.log(line.toString()) // eslint-disable-line
		}
	})

	while (!hasBooted) // eslint-disable-line
		await new Promise(r => setTimeout(r, 100)) // eslint-disable-line

	return serverProcess
}
