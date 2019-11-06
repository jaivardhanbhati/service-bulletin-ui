'use strict';
import dynamicListController from './DynamicListController';

const DynamicList = {
	templateUrl: 'modules/common/components/dynamicList/dynamicList.html',
	transclude: true,
	bindings: {
		rowContent: '<',
		onEvent: '&',
		addText: '@',
		titleText: '@',
		nextTitleText: '@'
	},
	controller: dynamicListController
};

export default DynamicList;
