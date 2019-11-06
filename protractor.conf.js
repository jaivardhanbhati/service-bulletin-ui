// An example configuration file.
exports.config = {

	baseUrl: 'http://localhost:9000',

//    seleniumAddress: 'http://localhost:4444/wd/hub',
//  getPageTimeout: 60000,
//  allScriptsTimeout: 500000,

//	directConnect: false,

//	chromeOnly: false,

	// Capabilities to be passed to the webdriver instance.
	capabilities: {
		browserName: 'chrome',
		version: '',
		platform: 'ANY'
	},

	// Framework to use. Jasmine is recommended.
	framework: 'custom',
	frameworkPath: require.resolve('protractor-cucumber-framework'),

	cucumberOpts: {
		format: 'pretty',
		require: ['test/e2e/steps/*.js', 'test/e2e/pages/*.js']
	},

	seleniumArgs: ['-browserTimeout=60'],

	// Spec patterns are relative to the current working directory when
	// protractor is called.
	specs: 'test/e2e/features/*.feature',

	// This is the selector that points to the element that has the data-ng-controller
	// attribute.  Protractor will then wait for this element to appear before running the tests
	rootElement: '#content'

};
