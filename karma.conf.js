/* global module */
module.exports = function (config) {
	'use strict';
	config.set({
		autoWatch: true,
		singleRun: true,
		colors: true,

	// Use either phantomjs-shim OR include below browser-polyfill.js to add bind() support to browser.
		frameworks: ['jspm', 'mocha', 'chai', 'chai-as-promised', 'sinon', 'phantomjs-shim'],

		files: [
			// polyfill needed for karma-babel-preprocessor < v6.0.
			'node_modules/babel-polyfill/dist/polyfill.js'
		],

		// preprocess matching files before serving them to the browser
		preprocessors: {
			'public/app.js': ['babel', 'sourcemap', 'coverage'],
			'public/modules/**/*.js': ['babel', 'sourcemap', 'coverage']
		},

		babelPreprocessor: {
			options: {
				sourceMap: 'inline'
			},
			sourceFileName: function (file) {
				return file.originalPath;
			}
		},

		jspm: {
			config: 'public/config.js',
			paths: {
				'*': '*.js',
				'github:*': 'public/jspm_packages/github/*',
				'npm:*': 'public/jspm_packages/npm/*',
				'ge:*': 'public/jspm_packages/ge/*',
				'assertion-error': 'public/jspm_packages/npm/assertion-error@1.0.2',
				'base64-js': 'public/jspm_packages/npm/base64-js@0.0.8',
				buffer: 'public/jspm_packages/npm/buffer@3.6.0',
				'type-detect': 'public/jspm_packages/npm/type-detect@1.0.0',
				'deep-eql': 'public/jspm_packages/npm/deep-eql@0.1.3',
				ieee754: 'public/jspm_packages/npm/ieee754@1.1.6',
				isarray: 'public/jspm_packages/npm/isarray@1.0.0',
				process: 'public/jspm_packages/npm/process@0.11.8'
				// Threw error when lodash was added because relative path between jspm modules not working.
			},
			loadFiles: [
				'public/modules/**/*.js',
				'public/main.js',
				'test/client-side/*.spec.js'
			],
			serveFiles: [
				'public/bower_components/**/*.js',
				'public/main.js',
				'public/modules/**/*.js',
				'public/jspm_packages/**/*.js'
			]
		},

		proxies: {
			'/public/': '/base/public/'
		},

		browsers: ['PhantomJS'],

		reporters: ['progress', 'junit', 'coverage'],

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// Configure the reporter
		coverageReporter: {
			instrumenters: { isparta: require('isparta') },
			instrumenter: {
				'**/*.js': 'isparta'
			},
			reporters: [{
				type: 'html',
				dir: 'coverage/'
			}, {
				type: 'cobertura',
				dir: 'coverage',
				subdir: 'cobertura'
			}, {
				type: 'text'
			}, {
				type: 'text-summary'
			}]
		},

		/**
		* JUnit Reporter options
		*/
		junitReporter: {
			outputDir: 'junit/',
			outputFile: '../junit.xml',
			suite: 'unit'
		}
	});
};
