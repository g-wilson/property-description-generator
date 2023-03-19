const BUNYAN_TO_STACKDRIVER = new Map([
	[ 60, 'CRITICAL' ],
	[ 50, 'ERROR' ],
	[ 40, 'WARNING' ],
	[ 30, 'INFO' ],
	[ 20, 'DEBUG' ],
	[ 10, 'DEBUG' ],
])

export class GoogleCloudLogStreamer {

	_formatErrorReport(chunk) {
		let errorText = chunk.error
		if (chunk.errorStack) {
			errorText = chunk.errorStack

			if (chunk.errorCause) {
				const [ firstLine, ...rest ] = chunk.errorStack.split('\n')

				errorText = [
					`${firstLine} [cause: ${chunk.errorCause}]`,
					...rest,
				].join('\n')
			}
		}

		return {
			'severity': BUNYAN_TO_STACKDRIVER.get(Number(chunk.level)),
			'eventTime': chunk.time,
			'serviceContext': {
				service: process.env.K_SERVICE, // eslint-disable-line no-process-env
				revision: process.env.K_REVISION, // eslint-disable-line no-process-env
			},
			'message': errorText,
			'@type': 'type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent',
			'context': {
				httpRequest: chunk.httpRequest,
				auth_user_id: chunk.auth_user_id,
				client_version: chunk.client_version,
			},
		}
	}

	_format(chunk) {
		return {
			...chunk,
			severity: BUNYAN_TO_STACKDRIVER.get(Number(chunk.level)),
		}
	}

	write(record) {
		if (record.error) {
			const errorReport = JSON.stringify(this._formatErrorReport(record))

			process.stderr.write(`${errorReport}\n`)
		}

		const logMsg = JSON.stringify(this._format(record))

		process.stdout.write(`${logMsg}\n`)
	}

}
