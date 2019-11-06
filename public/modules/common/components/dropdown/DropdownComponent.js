'use strict';
import dropdownController from './DropdownController';

const DropdownComponent = {
	templateUrl: 'modules/common/components/dropdown/dropdown.html',
	bindings: {
		dropdownId: '@',
		dropdownOptions: '<',
		eventHandler: '&',
		charWidth: '@',
		selectedItem: '@',
		selectMsg: '@'
	},
	controller: dropdownController
};

export default DropdownComponent;
