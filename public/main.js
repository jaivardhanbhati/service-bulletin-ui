// Framework dependencies
import angular from 'angular';
import 'angular-ui-router';
import 'angular-custom-elements';
import './modules/bulletin/module';
import './modules/common/module';
import 'angular-ui/bootstrap';

import 'hubs/ng-apphub-service';

/**
 * @name AppModule
 * @param {Provider} $locationProvider
 * @param {Provider} $httpProvider
 * @param {Provider} $urlRouterProvider
 * @param {Provider} $stateProvider
 * @description
 * Create our application, inject dependencies, and configure route behavior
 * NOTE: Injected modules will add their own routes
 */
const AppModule = angular.module('app', [
	'ui.router',
	'ui.bootstrap',
	'toastr',
	'AppHubModule',
	'BulletinModule',
	'CommonModule',
	'robdodson.poly-grip'
]).config(['$locationProvider', '$httpProvider', '$urlRouterProvider', '$stateProvider',
	($locationProvider,	$httpProvider,	$urlRouterProvider,	$stateProvider) => {
		// Batch multiple $http requests around the same time into one $digest
		$httpProvider.useApplyAsync(true);
		// This is your default route. User will get redirected
		// here if they type a weird route into the location bar.
		$urlRouterProvider.otherwise(($injector) => {
			var $state = $injector.get('$state');
			$state.go('bulletin');
		});
	}
]);

// Bootstrap our application once all that stuff is loaded
angular.element(document).ready(() => {
	return angular.bootstrap(document.querySelector('#content'), [AppModule.name], {
		strictDi: true // https://docs.angularjs.org/guide/di
	});
});

export default AppModule;
