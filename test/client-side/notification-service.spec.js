import 'angular';
import 'angular-toastr';
import { inject } from 'angular-mocks';
import { assert, expect } from 'chai';
import { spy } from 'sinon';
import NotificationService from '../../public/modules/common/services/NotificationService.js';

describe('NotificationServiceTests', () => {
	let notificationService, toastr, successSpy;
	beforeEach(module('CommonModule'));
	beforeEach(() => {
		inject(($injector) => {
			toastr = $injector.get('toastr');
			notificationService = new NotificationService(toastr);
			successSpy = spy(toastr, 'success');
		});
	});

	it('should have notifySuccess', () => {
		expect(notificationService.notifySuccess).to.exist;
	});

	it('notifySuccess should call toastr success', () => {
		notificationService.notifySuccess();
		expect(toastr.success).to.have.been.called;
		assert(successSpy.calledWith('Saved'));
	});

	it('should handle custom success messages', () => {
		notificationService.notifySuccess('It worked');
		assert(successSpy.calledWith('It worked'));
	});

	it('should have notifyFailure', () => {
		expect(notificationService.notifyFailure).to.exist;
	});

	it('notifyFailure should call toastr error', () => {
		notificationService.notifyFailure();
		expect(toastr.error).to.have.been.called;
	});
});
