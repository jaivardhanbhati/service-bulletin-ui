'use strict';
/** @class DropdownController
		@memberof DropdownComponent
*/
class DropdownController {
	/** @function constructor
			@param {angular} $timeout
			@memberof DropdownController
	*/
	constructor($timeout) {
		this.$timeout = $timeout;

		this.$postLink = () => {
			$timeout(() => {
				this.loadControls();
			});
		};
	}
	/** @function loadControls
			@memberof DropdownController
	*/
	loadControls() {
		document.querySelector(`px-dropdown#${this.dropdownId}`)
			.addEventListener('dropdown_content_value_changed', (e) => {
				this.eventHandler({ e: e });
			});
	}
}
DropdownController.$inject = ['$timeout'];
export default DropdownController;
