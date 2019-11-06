import { inject } from 'angular-mocks';
import { expect } from 'chai';

import LevelCirclesController from '../../public/modules/common/components/levelCircles/LevelCirclesController';

describe('LevelCirclesControllerTests', () => {
	let levelCirclesController;

	beforeEach(inject(($injector) => {
		levelCirclesController = new LevelCirclesController();
		levelCirclesController.onSelection = () => {}; // need to supply fn to component, but that functionality is in parent ctrl
	}));

	it('should be initialized', () => {
		expect(levelCirclesController).to.exist;
	});

	it('should create an array from 1 to n (specified in input)', () => {
		const expected = ['1', '2', '3', '4'];
		levelCirclesController.count = 4;
		levelCirclesController.startFrom = 1;
		expect(levelCirclesController.createArray()).to.deep.equal(expected);
	});

	it('should create an array from 0 to n (specified in input)', () => {
		const expected = ['0', '1', '2', '3'];
		levelCirclesController.count = 4;
		levelCirclesController.startFrom = 0;
		expect(levelCirclesController.createArray()).to.deep.equal(expected);
	});

	it('should create an array from 1 to n (specified in input) with NA', () => {
		const expected = ['NA', '1', '2', '3', '4'];
		levelCirclesController.count = 4;
		levelCirclesController.startFrom = 1;
		levelCirclesController.hasNa = true;
		expect(levelCirclesController.createArray()).to.deep.equal(expected);
	});

	it('should set the selected level to value clicked', () => {
		levelCirclesController.setSelectedLevel(1);
		expect(levelCirclesController.selection.level).to.equal(1);
		expect(levelCirclesController.onSelection).to.have.been.called;
	});
});
