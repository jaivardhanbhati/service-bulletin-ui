import { inject } from 'angular-mocks';
import { expect } from 'chai';

import BulletinCtrl from '../../public/modules/bulletin/controllers/bulletinController.js';

describe('BulletinControllerTests', () => {
	let bulletinService, httpBackend, log, scope, filter, bulletinCtrl;
	let bulletinServiceHandler, modelServiceHandler, updateServiceHandler, notificationService, featureFlagService;
	const engineModel = 'GE90-115B'; // do we need more cases handled?
	const bulletinResponse = () => ([
		{
			sb_id: '36',
			sb_number: '72-0013',
			sb_version: '3',
			title: 'ENGINE - No.2 Bearing Housing (72-26-02) - Shear Pins Added to Increase Load Capability',
			description: null,
			engine_model: 'GE90-115B',
			compliance_category: '3',
			impact_category: null,
			esn_applicability: null,
			status: 'PENDING',
			active: true,
			created_by: 'JOB',
			created_date: '2016-10-27T17:10:52.447Z',
			last_modified_by: 'JOB',
			last_modified_date: '2016-10-27T17:10:52.447Z',
			ServiceBulletinATA: [
				{
					id: '2',
					sb_id: '36',
					sb_number: '72-0013',
					sb_version: '3',
					ata: '72-26-02',
					created_by: null,
					created_date: '2016-10-27T17:10:53.280Z',
					last_modified_by: null,
					last_modified_date: '2016-10-27T17:10:53.280Z'
				}
			]
		}
	]);
	const additionalATA = () => ([
		{
			id: '2',
			sb_id: '36',
			sb_number: '72-0013',
			sb_version: '3',
			ata: '72-26-02',
			created_by: null,
			created_date: '2016-10-27T17:10:53.280Z',
			last_modified_by: null,
			last_modified_date: '2016-10-27T17:10:53.280Z'
		}
	]);
	const modelResponse = {
		models: ['GE90-115B']
	};
	const tabs = [
		{
			name: 'All SBs',
			key: 'ALL',
			active: true,
			selected: true,
			count: 0
		},
		{
			name: 'Pending Review',
			key: 'PENDING',
			active: true,
			selected: false,
			count: 0
		},
		{
			name: 'Reviewed',
			key: 'REVIEWED',
			active: true,
			selected: false,
			count: 0
		}
	];
	beforeEach(module('BulletinModule'));
	beforeEach(module('CommonModule'));

	beforeEach(() => {
		inject(($injector, _$rootScope_) => {
			// Set up the mock http service responses
			httpBackend = $injector.get('$httpBackend');
			log = $injector.get('$log');
			filter = $injector.get('$filter');
			scope = _$rootScope_;
			bulletinService = $injector.get('BulletinService');
			notificationService = $injector.get('NotificationService');
			featureFlagService = $injector.get('FeatureFlagService');
		});
		bulletinCtrl = new BulletinCtrl(scope, log, filter, bulletinService, notificationService, featureFlagService);
		bulletinServiceHandler = httpBackend.when('GET', `service/bulletins/servicebulletins?engineModel=${engineModel}`)
			.respond(200, bulletinResponse());
		modelServiceHandler = httpBackend.when('GET', 'service/bulletins/servicebulletins/enginemodels').respond(200, modelResponse);
		updateServiceHandler = httpBackend.when('PUT', 'service/bulletins/servicebulletins/36').respond(200);
		httpBackend.when('GET', 'envVars?name=feature_expandBulletin')
			.respond(200, { feature_expandBulletin: 'true' });
		httpBackend.when('GET', 'directives/toast/toast.html').respond(200);
	});

	afterEach(() => {
		httpBackend.verifyNoOutstandingExpectation();
		httpBackend.verifyNoOutstandingRequest();
	});

	it('should initialize bulletin controller', () => {
		expect(bulletinCtrl).to.exist;
		httpBackend.flush();
	});

	it('should get the list of engine models', () => {
		httpBackend.flush();
		expect(bulletinCtrl.models).to.have.length.of.at.least(1);
	});

	it('should enter error state if problem fetching engine models', () => {
		httpBackend.flush();
		modelServiceHandler.respond(400, { error: 'An error occurred' });
		bulletinCtrl.fetchEngineModel();
		httpBackend.flush();
		expect(bulletinCtrl.state.error.show).to.be.true;
	});

	it('should calculate the index of the first item on the page for pagination', () => {
		httpBackend.flush();
		bulletinCtrl.currentPage = 1;
		bulletinCtrl.itemsPerPage = 20;
		expect(bulletinCtrl.calculateFrom()).to.equal(0);
		bulletinCtrl.currentPage = 3;
		bulletinCtrl.itemsPerPage = 20;
		expect(bulletinCtrl.calculateFrom()).to.equal(40);
	});

	it('should calculate the index of the last item on the page for pagination', () => {
		httpBackend.flush();
		bulletinCtrl.currentPage = 1;
		bulletinCtrl.itemsPerPage = 20;
		expect(bulletinCtrl.calculateTo()).to.equal(20);
		bulletinCtrl.currentPage = 3;
		bulletinCtrl.itemsPerPage = 20;
		expect(bulletinCtrl.calculateTo()).to.equal(60);
	});

	it('should set the tab clicked to selected', () => {
		httpBackend.flush();
		bulletinCtrl.tabs = tabs;
		expect(bulletinCtrl.tabs[1].selected).to.be.false;
		bulletinCtrl.setSelectedTab(bulletinCtrl.tabs[1]);
		expect(bulletinCtrl.tabs[1].selected).to.be.true;
	});

	it('should only have one tab selected at a time', () => {
		httpBackend.flush();
		bulletinCtrl.tabs = tabs;
		let numSelected = tabs.reduce((n, tab) => {
			return n + (tab.selected === true);
		}, 0);
		expect(numSelected).to.equal(1);
		bulletinCtrl.setSelectedTab(bulletinCtrl.tabs[1]);
		numSelected = tabs.reduce((n, tab) => {
			return n + (tab.selected === true);
		}, 0);
		expect(numSelected).to.equal(1);
	});

	it('should trigger the error state if web service fails', () => {
		bulletinServiceHandler.respond(400, { error: 'An error occurred' });
		expect(bulletinCtrl.state.error.show).to.be.false;
		bulletinCtrl.fetchServiceBulletin(engineModel);
		httpBackend.flush();
		expect(bulletinCtrl.dataLoaded).to.be.true;
		expect(bulletinCtrl.state.error.show).to.be.true;
	});

	it('should trigger the no data state if the response is empty', () => {
		httpBackend.flush();
		bulletinServiceHandler.respond(200, []);
		bulletinCtrl.fetchServiceBulletin(engineModel);
		httpBackend.flush();
		expect(bulletinCtrl.state.noData.show).to.be.true;
		expect(bulletinCtrl.dataLoaded).to.be.true;
	});

	it('should set the data from the response', () => {
		httpBackend.flush();
		const data = bulletinResponse();
		data[0].date = '27 Oct 2016'; // need to add date to the response to account for logic in controller
		data[0].ata = ['72-26-02'];
		bulletinServiceHandler.respond(200, data);
		bulletinCtrl.fetchServiceBulletin(engineModel);
		httpBackend.flush();
		expect(bulletinCtrl.data).to.deep.equal(data);
		expect(bulletinCtrl.state.noData.show).to.be.false;
		expect(bulletinCtrl.dataLoaded).to.be.true;
	});

	it('should create additional date field for formatting and search', () => {
		httpBackend.flush();
		bulletinCtrl.fetchServiceBulletin(engineModel);
		httpBackend.flush();
		expect(bulletinCtrl.data[0]).to.include.keys('date');
		expect(bulletinCtrl.data[0].date).to.equal('27 Oct 2016');
	});

	it('should toggle the sort order if selected column did not change', () => {
		httpBackend.flush();
		bulletinCtrl.sortedBy = 'sb_number';
		bulletinCtrl.sortColumn('sb_number');
		expect(bulletinCtrl.reverse).to.be.true;
	});

	it('should set the sort order to ascending if selected column changed', () => {
		httpBackend.flush();
		bulletinCtrl.sortedBy = 'sb_number';
		bulletinCtrl.sortColumn('sb_version');
		expect(bulletinCtrl.reverse).to.be.false;
	});

	it('should fetch the service bulletins when the model is selected and not show an error', () => {
		httpBackend.flush();
		const e = {
			detail: {
				textValue: 'GE90-115B'
			}
		};
		bulletinCtrl.selectModel(e);
		httpBackend.flush();
		expect(bulletinCtrl.state.noModel.show).to.be.false;
		expect(bulletinCtrl.fetchServiceBulletin).to.have.been.called;
	});

	it('should set the items per page when selected from dropdown', () => {
		httpBackend.flush();
		const e = {
			detail: {
				textValue: 50
			}
		};
		expect(bulletinCtrl.itemsPerPage).to.equal(20);
		bulletinCtrl.selectItemsPerPage(e);
		expect(bulletinCtrl.itemsPerPage).to.equal(50);
	});

	it('should show no match results if filter returns nothing', () => {
		httpBackend.flush();
		bulletinCtrl.isCollapsed = false;
		bulletinCtrl.clearFilter();
		expect(bulletinCtrl.search).to.be.empty;
	});

	it('should return all null entries when clear filter', () => {
		httpBackend.flush();
		bulletinCtrl.search.title = '';
		bulletinCtrl.clear('title');
		expect(bulletinCtrl.search.title).to.not.exist;
		bulletinCtrl.search.ServiceBulletinATA = {
			level_of_disassembly: ''
		};
		bulletinCtrl.clear('ServiceBulletinATA.level_of_disassembly');
		expect(bulletinCtrl.search.ServiceBulletinATA).to.not.exist;
	});

	it('should update the status counts on change of tab selected', () => {
		httpBackend.flush();
		bulletinCtrl.tabs = tabs;
		bulletinCtrl.data = bulletinResponse();

		const data = bulletinCtrl.data[0];
		const event = { selectedLevel: '2' };
		const ata = data.ServiceBulletinATA[0];
		bulletinCtrl.selectLevel(event, ata, data);
		expect(bulletinCtrl.tabs[2].count).to.equal(0);
		bulletinCtrl.setSelectedTab(bulletinCtrl.tabs[1]);
		expect(bulletinCtrl.tabs[2].count).to.equal(1);
		httpBackend.flush();
	});

	it('should set reviewed to "REVIEWED" for row if all atas have level of assembley', () => {
		httpBackend.flush();
		let data = bulletinResponse()[0];
		const event = { selectedLevel: '2' };
		const ata = data.ServiceBulletinATA[0];
		bulletinCtrl.selectLevel(event, ata, data);
		httpBackend.flush();
		expect(data.status).to.equal('REVIEWED');

		data = bulletinResponse()[0];
		const temp = data.ServiceBulletinATA;
		temp.push(additionalATA());
		bulletinCtrl.selectLevel(event, temp[0], data);
		httpBackend.flush();
		bulletinCtrl.selectLevel(event, temp[1], data);
		httpBackend.flush();
		expect(data.status).to.equal('REVIEWED');
	});

	it('should set reviewed to "PENDING" for row if all atas do not have level of assembley', () => {
		httpBackend.flush();
		const event = { selectedLevel: '2' };
		bulletinCtrl.data = bulletinResponse();
		const data = bulletinCtrl.data[0];
		const temp = data.ServiceBulletinATA;
		temp.push(additionalATA());
		bulletinCtrl.selectLevel(event, temp[0], data);
		httpBackend.flush();
		expect(data.status).to.equal('PENDING');
	});

	it('should notify error if problem updating service bulletin', () => {
		httpBackend.flush();
		updateServiceHandler.respond(400, { error: 'An error occurred' });
		const data = bulletinResponse()[0];
		const event = { selectedLevel: '2' };
		const ata = data.ServiceBulletinATA[0];
		bulletinCtrl.selectLevel(event, ata, data);
		httpBackend.flush();
		expect(notificationService.notifyFailure).to.have.been.called;
	});

	it('should set the counts by status', () => {
		httpBackend.flush();
		bulletinCtrl.data = bulletinResponse();
		bulletinCtrl.statusCount(bulletinCtrl.data);
		expect(bulletinCtrl.tabs[1].count).to.equal(1);
		expect(bulletinCtrl.tabs[2].count).to.equal(0);
	});

	it('should filter the data to show based on status', () => {
		httpBackend.flush();
		let count = 0;
		bulletinCtrl.data = bulletinResponse();
		bulletinCtrl.tabs = tabs;
		bulletinCtrl.setSelectedTab(tabs[0]);
		expect(bulletinCtrl.displayedData).to.equal(bulletinCtrl.data);
		bulletinCtrl.setSelectedTab(tabs[1]);
		bulletinCtrl.displayedData.forEach((obj) => {
			if (obj.status === tabs[1].key) {
				count++;
			}
		});
		expect(count).to.equal(1);
		count = 0;
		bulletinCtrl.setSelectedTab(tabs[2]);
		bulletinCtrl.displayedData.forEach((obj) => {
			if (obj.status === tabs[1].key) {
				count++;
			}
		});
		expect(count).to.equal(0);
	});
});
