const TIMEOUT_MILLISECONDS = 29000;

/** @class FeatureFlagService
		@memberof Common
*/
class FeatureFlagService {
	/**
	 * @function constructor
	 * @param {angular} $http
	 * @param {angular} $q
	 * @memberof Common.FeatureFlagService
	 */
	constructor($http, $q) {
		this.$http = $http;
		this.$q = $q;
	}

	/**
	 * @function getEnvVar
	 * @param {string} envName
	 * @memberof Common.FeatureFlagService
	 * @returns {boolean} value of environment variable as boolean if found. otherwise, returns true
	 */
	getEnvVar(envName) {
		return this.$http({
			url: 'envVars',
			params: (envName ? { name: envName } : ''),
			method: 'GET',
			timeout: TIMEOUT_MILLISECONDS
		})
		.then((response) => {
			if (typeof response.data !== 'undefined' && typeof response.data[envName] !== 'undefined') {
				return response.data[envName] === 'true';
			} else {
				// to hide a feature, the feature flag should explicitly be set to false. This ensures
				// that if the feature flag is removed from the env, that feature will still display
				// without modifying the code to remove the feature flag check
				return true;
			}
		}, (errorResponse) => {
			return this.$q.reject(errorResponse);
		});
	}
}

FeatureFlagService.$inject = ['$http', '$q'];
// Export an instance
export default FeatureFlagService;
