'use strict';
const appname = 'Service Bulletin';
const express = require('express');
const serveStatic = require('serve-static');
const dataServiceHandler = require('./server/serviceHandler');
const _ = require('lodash');
const app = express();

app.get('/envVars', (req, res) => {
	if (req.query.name && _.startsWith(req.query.name, 'feature')) {
		res.json(_.pick(process.env, [req.query.name]));
	} else {
		res.status = 400;
		res.json({ errorMessage: 'No environment variable available with given name' });
	}
});

// ========================================================================
// SERVICE PROXIES
app.use('/service', dataServiceHandler);

// ========================================================================
// STATIC ASSETS
// serveStatic() here will cache these static assets in memory so we don't
// read them from the filesystem for each request.

/** @function setStaticAssetsCacheControl
		@param {response} res
		@param {path} path
		@memberof app
		@description look for a 'Cache-Control' header on the
		request and add it to the response for these static assets. This can be
		used by a tenant who needs aggressive caching
*/
function setStaticAssetsCacheControl(res, path) {
	if (res.req.headers['Cache-Control'] || res.req.headers['cache-control']) {
		res.setHeader('Cache-Control', res.req.headers['Cache-Control'] || res.req.headers['cache-control']);
	}
}
// http://expressjs.com/en/advanced/best-practice-performance.html
app.use('/', serveStatic('public', {
	setHeaders: setStaticAssetsCacheControl
}));

// ========================================================================
// START THE SERVER
// Need to let CF set the port if we're deploying there.
const port = process.env.PORT || 9000;
let server;

/** @function start
		@param {callback} cb
		@memberof app
		@description start the server
		@return {listener} listener to the server
*/
function start(cb) {
	server = require('http').createServer(app);

	return server.listen(port, () => {
		if (cb) {
			cb();
		}
	});
}

/** @function shutdown
		@param {callback} cb
		@memberof app
		@description shutdown the server=
*/
function shutdown(cb) {
	server.close(cb);
	console.info('server shutdown');
}

module.exports = {
	start: start,
	shutdown: shutdown,
	app: app
};

if (require.main === module) {
	start(() => {
		console.log(appname + ' started on port ' + port);
	});
}
