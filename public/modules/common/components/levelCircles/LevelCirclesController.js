'use strict';
/** @class LevelCirclesController
		@memberof LevelCircles
*/
class LevelCirclesController {
	/** @function constructor
			@memberof LevelCirclesController
	*/
	constructor() {
		this.selection = {
			level: this.selectedLevel
		};

		this.$onChanges = (changes) => {
			if (changes.selectedLevel) {
				this.selection.level = changes.selectedLevel.currentValue;
			}
		};
	}
	/** @function createArray
			@memberof LevelCirclesController
			@returns {Array} array of numbers for circle values
	*/
	createArray() {
		let array = Array.from({ length: this.count }, (e, i) => (i + this.startFrom).toString());
		if (this.hasNa) {
			array.splice(0, 0, 'NA');
		}
		return array;
	}

	/** @function setSelectedLevel
			@memberof LevelCirclesController
			@param {Number} level value for circle selected
	*/
	setSelectedLevel(level) {
		this.selection.level = level;
		this.onSelection({
			$event: {
				selectedLevel: this.selection.level
			}
		});
	}

}
LevelCirclesController.$inject = [];
export default LevelCirclesController;
