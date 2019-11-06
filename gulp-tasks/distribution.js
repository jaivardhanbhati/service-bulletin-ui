'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');
var del = require('del');
var shell = require('gulp-shell');
var vulcanize = require('gulp-vulcanize');

var paths = {
	app: {
		basePath: 'public/'
	},
	build: {
		dist: 'dist/'
	}
};

gulp.task('dist:local', () => {
	runSequence('dist:clean', 'deps', 'sass', 'dist:files', 'dist:bundle');
});

gulp.task('dist', () => {
	runSequence('dist:clean', 'sass', 'depcache', 'dist:files', 'dist:vulcanize', 'dist:bundle');
});

gulp.task('dist:clean', (cb) => {
	del.sync(['./dist']);
	cb();
});

// Copy production files from public/ to dist/app/
gulp.task('dist:files', () => {
	gulp.src([
		// copy public/
		'' + paths.app.basePath + '**/*',
		// except tests and stylesheets from modules/
		'!' + paths.app.basePath + 'test/',
		'!' + paths.app.basePath + 'test/**',
		'!' + paths.app.basePath + 'modules/**/test/',
		'!' + paths.app.basePath + 'modules/**/test/**',
		'!' + paths.app.basePath + 'modules/**/styles/',
		'!' + paths.app.basePath + 'modules/**/styles/**'
	])
		.pipe(gulp.dest('./dist/public'));

	// Copy node/express stuff
	gulp.src(['./app.js', './package.json'])
		.pipe(gulp.dest('./dist'));
	gulp.src(['server/**'])
		.pipe(gulp.dest('./dist/server'));
});

// Depencency cache for SPDY
gulp.task('depcache', () => {
	return gulp.src(paths.app.basePath, { read: false })
		.pipe(shell([
			'jspm depcache main'
		]));
});

gulp.task('dist:bundle', () => {
	return gulp.src(paths.app.basePath)
		.pipe(shell([
			'jspm bundle main ' + paths.app.basePath + 'bundle.js --inject --minify' +
			'&& mv ' + paths.app.basePath + 'bundle* ' + paths.build.dist + '/public' +
			'&& cp ' + paths.app.basePath + 'config.js ' + paths.build.dist + '/public' +
			'&& jspm unbundle'
		]));
});

// Vulcanize polymer
gulp.task('dist:vulcanize', () => {
	return gulp.src('public/elements.html')
		.pipe(vulcanize({
			inlineScripts: true,
			inlineCss: true,
			stripComments: true
		}))
		.pipe(gulp.dest('./dist/public'));
});
