var gulp = require('gulp');

var paths = {
	app: {
		basePath: 'public/',
		scripts: ['public/app.js',
			'public/app-controller.js',
			'public/modules/**/*.js',
			'!public/**/*.spec.js']
	},
	build: {
		dist: 'dist/'
	}
};

gulp.task('scripts:watch', () => {
	gulp.watch(paths.app.scripts, []);
});
