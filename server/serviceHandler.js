/** @namespace serviceHandler
* @see {@link http://localhost:9000/api-docs/index.html|Swagger Docs}
*/
const express = require('express');
const proxy = require('express-request-proxy');

const defaultTimeout = 5000;

const dataServicesRouter = express.Router();
const serviceBulletinBaseUrl = process.env.serviceBulletinService || 'https://service-bulletin-data-svc-dev.run.asv-pr.ice.predix.io/api/v1';

dataServicesRouter.all('*', (req, res, next) => {
	// Set the cache-control header on the response for all
	// API calls.  The browser should not cache these calls.
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
});

dataServicesRouter.use('/bulletins/?*', (req, res, next) => {
	proxy({
		url: serviceBulletinBaseUrl + '/*',
		timeout: parseInt(req.headers.timeout) || defaultTimeout,
		originalQuery: req.originalUrl.indexOf('?') >= 0
		// Don't sanitize query parameters (allow square braces to pass). But only enable if query params are present.
	})(req, res, next);
});
module.exports = dataServicesRouter;
