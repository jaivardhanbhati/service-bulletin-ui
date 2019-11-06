'use strict';
import _ from 'lodash';

/** @class BulletinController
*	@memberof Bulletin
*/
class BulletinController {
	/** @function constructor
			@param {angular} $scope
			@param {angular} $log
			@param {angular} $filter
			@param {service} BulletinService
			@param {service} NotificationService
			@param {service} FeatureFlagService
			@memberof Bulletin.BulletinController
	*/
	constructor($scope, $log, $filter, BulletinService, NotificationService, FeatureFlagService) {
		this.$scope = $scope;
		this.$log = $log;
		this.$filter = $filter;
		this.bulletinService = BulletinService;
		this.featureFlagService = FeatureFlagService;
		this.NotificationService = NotificationService;
		this.bulletinExpandFlag = this.featureFlagService.getEnvVar('feature_expandBulletin').then((flagVal) => {
			this.bulletinExpandFlag = flagVal;
		}, (errorResponse) => {
			this.$log.error('Could not get service bulletin feature flag', errorResponse);
		});
		this.workscopeTitle = '';
		this.isCollapsed = true;
		this.currentPage = 1;
		this.itemsPerPage = 20;
		this.dataLoaded = true;
		this.reverse = false;
		this.levelsStart = 1;
		this.search = {};

		this.state = {
			noModel: {
				message: 'Select a model to show service bulletin.',
				show: true
			},
			noData: {
				message: 'No service bulletin available for selected engine model.',
				show: false
			},
			noFilterMatch: {
				message: 'No service bulletin available to match filters.',
				show: false
			},
			error: {
				message: 'Service bulletins could not be retrieved.',
				show: false
			},
			none: {
				message: 'No message',
				show: false
			}
		};
		this.data = [];
		this.displayedData = [];
		this.models = [];
		this.pageItems = ['20', '50', '100'];
		this.tabs = [
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
		this.fetchEngineModel();
	}

	/** @function setErrorStates
			@param {key} error
			@memberof Bulletin.BulletinController
	*/
	setErrorStates(error) {
		for (const k in this.state) {
			this.state[k].show = (k === error);
		}
	}

	/** @function findMessage
	 @memberof Bulletin.BulletinController
	 @returns {string} error message
	 */
	findMessage() {
		for (const k in this.state) {
			if (this.state[k].show) {
				return this.state[k].message;
			}
		}
	}

	/** @function clear
			@param {key} key
			@memberof Bulletin.BulletinController
	*/
	clear(key) {
		const path = _.toPath(key);
		let val = this.search;
		path.forEach((item) => {
			val = val[item];
		});
		if (!val) {
			delete this.search[path[0]];
		}
	}
	/** @function clearFilter
			@memberof Bulletin.BulletinController
	*/
	clearFilter() {
		this.isCollapsed = !this.isCollapsed;
		this.search = {};
	}
	/** @function fetchEngineModel
			@memberof Bulletin.BulletinController
	*/
	fetchEngineModel() {
		this.bulletinService.getEngineModels().then((response) => {
			this.models = response.data.models;
		}, (errorResponse) => {
			this.setErrorStates('error');
			this.$log.error('Could not get available engine models', errorResponse);
		});
	}

	/** @function fetchServiceBulletin
			@param {string} engineModel
			@memberof Bulletin.BulletinController
	*/
	fetchServiceBulletin(engineModel) {
		this.data = [];
		this.dataLoaded = false;
		this.setErrorStates('none');
		if (engineModel.startsWith('CFM56')) {
			this.levelsStart = 0;
		} else {
			this.levelsStart = 1;
		}

		this.bulletinService.getServiceBulletin(engineModel).then((response) => {
			if (response.data.length === 0) {
				this.setErrorStates('noData');
				this.displayedData = [];
			} else {
				this.setErrorStates('none');
				this.data = response.data;

				// format date and sort by SB number
				this.data.forEach(item => {
					item.date = this.$filter('date')(item.created_date, 'dd MMM yyyy');
					if (item.ServiceBulletinATA.length === 0) {
						item.ata = ['N/A'];
					} else {
						item.ata = item.ServiceBulletinATA.map(info => info.ata);
					}
				});
				this.displayedData = this.data;
				this.sortColumn('sb_number');
				this.statusCount(this.data);
				this.tabs[0].count = this.data.length;
			}
			this.dataLoaded = true;
		}, (errorResponse) => {
			this.dataLoaded = true;
			this.setErrorStates('error');
			this.$log.error('Could not locate service bulletin', errorResponse);
		});
	}
	/** @function statusCount
			@param {object} data
			@memberof Bulletin.BulletinController
	*/
	statusCount(data) {
		const counts = _.countBy(data, 'status');
		this.tabs[1].count = typeof counts.PENDING === 'undefined' ? 0 : counts.PENDING;
		this.tabs[2].count = typeof counts.REVIEWED === 'undefined' ? 0 : counts.REVIEWED;
	}
	/** @function sortColumn
			@param {string} key
			@memberof Bulletin.BulletinController
	*/
	sortColumn(key) {
		if (this.sortedBy === key) {
			this.reverse = !this.reverse;
		} else {
			this.sortedBy = key;
			this.reverse = false;
		}
		this.displayedData = this.$filter('orderBy')(this.data, key, this.reverse);
	}
	/** @function calculateFrom
			@returns {number} index of last item in the page
			@memberof Bulletin.BulletinController
	*/
	calculateFrom() {
		return ((this.currentPage - 1) * this.itemsPerPage);
	}

	/** @function calculateTo
			@returns {number} index of first item in the page
			@memberof Bulletin.BulletinController
	*/
	calculateTo() {
		return this.currentPage * this.itemsPerPage;
	}

	/** @function setSelectedTab
			@param {object} tab
			@memberof Bulletin.BulletinController
	*/
	setSelectedTab(tab) {
		this.deselectTabs();
		tab.selected = true;
		if (tab.key === 'ALL') {
			this.displayedData = this.data;
		} else {
			this.displayedData = this.data.filter((obj) => {
				return obj.status === tab.key;
			});
		}
		this.statusCount(this.data);
	}

	/** @function setSelectedTab
			@param {object} tab
			@memberof Bulletin.BulletinController
	*/
	deselectTabs() {
		this.tabs.forEach(tab => {
			tab.selected = false;
		});
	}

	/** @function selectModel
				@param {event} e - comes from px/component
				@memberof Bulletin.BulletinController
		*/
	selectModel(e) {
		this.setErrorStates('none');
		this.fetchServiceBulletin(e.detail.textValue);
		this.$scope.$apply();
	}

	/** @function selectItemsPerPage
				@param {event} e - comes from px/component
				@memberof Bulletin.BulletinController
		*/
	selectItemsPerPage(e) {
		this.itemsPerPage = e.detail.textValue;
		this.$scope.$apply();
	}
	/** @function checkStatus
				@param {Object} ata
				@memberof Bulletin.BulletinController
				@returns {boolean} true if level is set, false if not
		*/
	checkStatus(ata) {
		return ata.hasOwnProperty('level_of_disassembly') && Boolean(ata['level_of_disassembly']);
	};

	/** @function selectLevel
				@param {event} event
				@param {Object} ata - ata selected
				@param {Object} bulletin - full bulletin data obj
				@memberof Bulletin.BulletinController
		*/
	selectLevel(event, ata, bulletin) {
		ata.level_of_disassembly = event.selectedLevel;
		const index = bulletin.ServiceBulletinATA.indexOf(ata);
		bulletin.ServiceBulletinATA[index].level_of_disassembly = event.selectedLevel;
		bulletin.status = bulletin.ServiceBulletinATA.every(this.checkStatus) ? 'REVIEWED' : 'PENDING';

		this.bulletinService.updateServiceBulletin(bulletin.sb_id, bulletin.sb_version, bulletin.sb_number, {
			ServiceBulletinATA: bulletin.ServiceBulletinATA,
			status: bulletin.status
		}).then((response) => {
			console.log(response, 'SUCCESS');
			this.NotificationService.notifySuccess('Saved');
		}, (errorResponse) => {
			this.NotificationService.notifyFailure('Could not update service bulletin', errorResponse);
			this.$log.error('Could not update service bulletin', errorResponse);
		});
	}
}
// Strict DI for minification (order is important)
BulletinController.$inject = ['$scope', '$log', '$filter', 'BulletinService', 'NotificationService', 'FeatureFlagService'];

export default BulletinController;
