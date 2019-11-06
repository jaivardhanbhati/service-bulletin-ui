'use strict';
/** @class DynamicListController
		@memberof DynamicList
*/
class DynamicListController {
	/** @function constructor
			@memberof DynamicListController
	*/
	constructor() {
		this.selection = {
			level: this.selectedLevel
		};
	}

	/**
	 * @function addRow
	 */
	addRow() {
		console.log(this.rowContent);
	}

	/**
	 * @function deleteRow
	 */
	deleteRow() {
		console.log(this.rowContent);
	}

}
DynamicListController.$inject = [];
export default DynamicListController;
