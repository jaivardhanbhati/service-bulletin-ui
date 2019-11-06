import angular from 'angular';
import 'angular-ui-router';

import BulletinController from './controllers/bulletinController';
import BulletinService from './services/bulletinService';

// Hmmm... what's the right way to do this
// so this module doesn't have to know where it lives?
const path = './modules/bulletin/';

const BulletinModule = angular.module('BulletinModule', [
	'ui.router',
	'CommonModule'
])

	// Controllers
	.controller('bulletinController', BulletinController)
	.service('BulletinService', BulletinService)
	.filter('offset', () => {
		return function (input, start, end) {
			start = parseInt(start, 10);
			end = parseInt(end, 10);
			return input.slice(start, end);
		};
	})

	// Routes
	.config(['$stateProvider', function ($stateProvider) {
		$stateProvider
			.state('bulletin', {
				url: '/bulletin',
				controller: 'bulletinController',
				templateUrl: path + 'views/bulletin.html',
				title: 'Service Bulletin',
				controllerAs: 'sbm'
			});
	}]);

export default BulletinModule;
