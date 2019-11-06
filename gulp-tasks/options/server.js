'use strict';

var gulp = require('gulp');
var server = require('gulp-develop-server');
var livereload = require('gulp-livereload');

var options = {
	server: {
		path: './app.js'
	}
};

var serverFiles = [
	'./app.js',
	'./server/**'
];

gulp.task('server:start', () => {
	server.listen(options.server, livereload.listen);
});

gulp.task('server:restart', () => {
	function restart(file) {
		server.changed((error) => {
			if (!error) livereload.changed(file.path);
		});
	}
	gulp.watch(serverFiles).on('change', restart);
});

gulp.task('server:watch', ['server:start'], () => {
	gulp.watch(serverFiles, ['server:restart']);
});
