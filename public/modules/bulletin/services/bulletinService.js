import angular from 'angular';
'use strict';

const TIMEOUT_MILLISECONDS = 29000;

/** @class BulletinService
*	@memberof Bulletin
*/
class BulletinService {

	/** @function constructor
			@param {angular} $log
			@param {angular} $http
			@param {angular} $q
			@memberof Bulletin.BulletinService
	*/
	constructor($log, $http, $q) {
		this.$log = $log;
		this.$http = $http;
		this.$q = $q;
		this.$log.info('service bulletin loaded');
	}

	/** @function getEngineModels
			@memberof Bulletin.BulletinService
			@returns {string} response
	*/
	getEngineModels() {
		const url = 'service/bulletins/servicebulletins/enginemodels';
		return this.$http({
			url: url,
			method: 'GET',
			timeout: TIMEOUT_MILLISECONDS
		})
		.then((response) => {
			// Any Data Manipulation happens here -
			return response;
		}, (errorResponse) => {
			return this.$q.reject(errorResponse);
		});
	}

	/** @function getServiceBulletin
			@param {string} model
			@memberof Bulletin.BulletinService
			@returns {string} response
	*/
	getServiceBulletin(model) {
		const url = 'service/bulletins/servicebulletins';
		return this.$http({
			url: url,
			method: 'GET',
			params: {
				engineModel: model
			},
			timeout: TIMEOUT_MILLISECONDS
		})
		.then((response) => {
			// Any Data Manipulation happens here -
			return response;
		}, (errorResponse) => {
			return this.$q.reject(errorResponse);
		});
	}

	/** @function updateServiceBulletin
			@param {number} id
			@param {number} version
			@param {number} number
			@param {Object} payload
			@memberof Bulletin.BulletinService
			@returns {string} response
	*/
	updateServiceBulletin(id, version, number, payload) {
		const required = {
			sb_id: id,
			sb_version: version,
			sb_number: number
		};
		angular.extend(payload, required);

		return this.$http({
			url: 'service/bulletins/servicebulletins/' + id,
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			data: payload
		}).then((response) => {
			return response.data;
		}, (errorResponse) => {
			return this.$q.reject(errorResponse);
		});
	}
}
BulletinService.$inject = ['$log', '$http', '$q'];

// Export an instance
export default BulletinService;
