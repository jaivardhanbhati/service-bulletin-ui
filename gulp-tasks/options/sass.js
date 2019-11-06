'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var importOnce = require('node-sass-import-once');

var paths = {
	app: {
		basePath: 'public/',
		styles: ['public/styles/**/*.scss', 'public/modules/**/*.scss']
	}
};

gulp.task('sass', (cb) => {
	return gulp.src(paths.app.styles)
		.pipe(sass({
			includePaths: ['./public/bower_components/'],
			importer: importOnce
		}).on('error', sass.logError))
		.pipe(gulp.dest(paths.app.basePath + 'styles'));
});

gulp.task('sass:watch', () => {
	gulp.watch(paths.app.styles, ['sass']);
});
