'use strict';

var gulp = require('gulp');
var bower = require('gulp-bower');
var shell = require('gulp-shell');

var paths = {
	app: {
		basePath: 'public/'
	}
};

// Update runtime deps
gulp.task('deps', (cb) => {
	// main bower.json
	bower();
	return gulp.src(paths.app.basePath, { read: false })
		.pipe(shell(['jspm install']));
});
