import 'angular';
import { inject } from 'angular-mocks';
import { expect, assert } from 'chai';

import BulletinService from '../../public/modules/bulletin/services/bulletinService.js';

describe('BulletinServiceTests', () => {
	let bulletinService, http, httpBackend, log, q, bulletinServiceHandler, modelServiceHandler;

	const engineModel = 'GE90'; // do we need more cases handled?
	const bulletinResponse = [
		{
			id: '1',
			sb_number: '234-234',
			title: 'testSB1',
			description: 'SB desc',
			engine_model: 'GE90',
			ata_number: '70-00-00',
			version: '1',
			compliance_category: '2',
			impact_category: null,
			esn_applicability: null,
			status: 'UNACCEPTED',
			active: true,
			created_by: 'ADMIN',
			created_date: '2016-10-18T22:08:00.842Z',
			last_modified_by: 'ADMIN',
			last_modified_date: '2016-10-18T22:08:00.842Z'
		}
	];
	const modelResponse = [
		'GE90'
	];

	beforeEach(() => {
		inject(($injector) => {
			// Set up the mock http service responses
			httpBackend = $injector.get('$httpBackend');
			http = $injector.get('$http');
			log = $injector.get('$log');
			q = $injector.get('$q');
			bulletinService = new BulletinService(log, http, q);
		});

		bulletinServiceHandler = httpBackend.when('GET', `service/bulletins/servicebulletins?engineModel=${engineModel}`)
			.respond(200, bulletinResponse);
		modelServiceHandler = httpBackend.when('GET', 'service/bulletins/servicebulletins/enginemodels').respond(200, modelResponse);
	});

	afterEach(() => {
		httpBackend.verifyNoOutstandingExpectation();
		httpBackend.verifyNoOutstandingRequest();
	});

	it('should have the get service bulletin method', () => {
		expect(bulletinService.getServiceBulletin).to.exist;
	});

	it('should retrieve the available engine models', () => {
		bulletinService.getEngineModels().then((response) => {
			expect(response).to.exist;
			expect(response.data[0]).to.equal('GE90');
		});
		httpBackend.flush();
	});

	it('should handle errors in engine model request', () => {
		modelServiceHandler.respond(400, { error: 'An error occurred' });
		bulletinService.getEngineModels().then((response) => {
			assert.fail('got response', 'error', 'should not have gotten response');
		}, (errorResponse) => {
			expect(errorResponse).to.exist;
		});
		httpBackend.flush();
	});

	it('should retrieve the service bulletins given an engine model', () => {
		bulletinService.getServiceBulletin(engineModel).then((response) => {
			expect(response).to.exist;
			expect(response.data[0].id).to.equal('1');
			expect(response.data[0].title).to.equal('testSB1');
		});
		httpBackend.flush();
	});

	it('should handle errors in service bulletin request', () => {
		bulletinServiceHandler.respond(400, { error: 'An error occurred' });
		bulletinService.getServiceBulletin(engineModel).then((response) => {
			assert.fail('got response', 'error', 'should not have gotten response');
		}, (errorResponse) => {
			expect(errorResponse).to.exist;
		});
		httpBackend.flush();
	});
});
