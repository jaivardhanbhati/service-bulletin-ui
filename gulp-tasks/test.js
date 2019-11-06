'use strict';

var gulp = require('gulp');
var karma = require('karma');
var shell = require('gulp-shell');
const path = require('path');
const del = require('del');

gulp.task('test:unit', (cb) => {
	var karmaServer = new karma.Server({
		configFile: path.join(__dirname, '../karma.conf.js'),
		singleRun: true
	});
	karmaServer.start();
});

gulp.task('test:clean', (cb) => {
	del.sync(['./docs']);
	del.sync(['./public/out']);
	cb();
});

gulp.task('test:docs', shell.task('jsdoc -c conf.json'));

gulp.task('test:backend', shell.task('PORT=0 mocha test'));

gulp.task('web-driver:update', shell.task('webdriver-manager update'));

gulp.task('test:e2e', ['web-driver:update'], shell.task('protractor protractor.conf.js'));

gulp.task('test', ['test:clean', 'test:docs', 'test:unit', 'test:backend']);//, 'test:e2e']);
