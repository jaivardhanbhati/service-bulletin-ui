'use strict';
import levelCirclesController from './LevelCirclesController';

const LevelCircles = {
	templateUrl: 'modules/common/components/levelCircles/levelCircles.html',
	bindings: {
		hasNa: '<',
		count: '<',
		startFrom: '<',
		selectedLevel: '@',
		onSelection: '&'
	},
	controller: levelCirclesController
};

export default LevelCircles;
