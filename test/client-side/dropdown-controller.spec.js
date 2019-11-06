import { inject } from 'angular-mocks';
import { expect } from 'chai';

import DropdownController from '../../public/modules/common/components/dropdown/DropdownController';

describe('DropdownControllerTests', () => {
	let dropdownController, timeout;

	beforeEach(inject(($injector) => {
		timeout = $injector.get('$timeout');
		dropdownController = new DropdownController(timeout);
	}));

	it('should be initialized', () => {
		expect(dropdownController).to.exist;
	});

	it('should create the event listeners for the component', () => {
		expect(dropdownController.loadControls).to.have.been.called;
	});
});
