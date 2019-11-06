import 'angular';
import { inject } from 'angular-mocks';
import 'chai';

describe('FeatureFlagServiceTests', () => {
	let featureFlagService, httpBackend;

	beforeEach(module('CommonModule'));
	beforeEach(() => {
		inject(($injector) => {
			httpBackend = $injector.get('$httpBackend');
			featureFlagService = $injector.get('FeatureFlagService');
		});
		// console.log('featureFlagService', featureFlagService);
		httpBackend.when('GET', 'envVars?name=feature_falseFlag')
			.respond(200, { feature_falseFlag: 'false' });
		httpBackend.when('GET', 'envVars?name=feature_trueFlag')
			.respond(200, { feature_trueFlag: 'true' });
		httpBackend.when('GET', 'envVars?name=feature_unknownFlag')
			.respond(200, {});
	});

	it('should have retrieve true for the trueFlag', (done) => {
		console.log('trueFlag', featureFlagService);
		featureFlagService.getEnvVar('feature_trueFlag').should.eventually.equal(true);
		httpBackend.flush();
		done();
	});

	it('should have retrieve false for the falseFlag', (done) => {
		featureFlagService.getEnvVar('feature_falseFlag').should.eventually.equal(false);
		httpBackend.flush();
		done();
	});

	it('should default to true if the flag is not found', (done) => {
		featureFlagService.getEnvVar('feature_unknownFlag').should.eventually.equal(true);
		httpBackend.flush();
		done();
	});
});
