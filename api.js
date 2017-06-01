'use strict'

const fs = require('fs')
const path = require('path')
const LineReader = require('line-by-line')
const logFileLocation = '/data/logs/daemon.log'

module.exports = function api (plugin, router) {
	
	/**
	 * @api {get} /plugins/com.printr.log-reader/api/logs Logs:read
	 * @apiGroup Plugin:logs
	 * @apiDescription Download the daemon.log file from The Element
	 * @apiVersion 2.0.0
	 * @apiUse user
	 * @apiUse NotFound
	 */
	router.get('/logs', function (req, res) {

		const resolvedFileLocation = path.resolve(logFileLocation)

		const exists = fs.existsSync(resolvedFileLocation)
		if (!exists) return res.notFound('Could not find log file')

		const limit = +(req.query.limit || 1000)
		const skip = +(req.query.skip || 0)
		let lines = []

		const lineReader =  new LineReader(resolvedFileLocation, {
			start: skip,
			end: skip + limit,
			skipEmptyLines: true
		})

		lineReader.on('line', (line) => {
			lines.push(line)
		})

		lineReader.on('error', (err) => {
			return res.serverError(err)
		})

		lineReader.on('end', () => {
			return res.ok({
				logs: lines,
				success: true
			})
		})
	})
	
	return router
}
