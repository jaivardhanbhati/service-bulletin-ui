/**
 * Created by 212329930 on 11/3/16.
 */
import angular from 'angular';
import 'angular-mocks';
import { expect } from 'chai';
import ConfirmationModalDirective from '../../public/modules/common/directives/confirmationModal/ConfirmationModalDirective';
import ConfirmationModalController from '../../public/modules/common/directives/confirmationModal/ConfirmationModalController';

describe('ConfirmModalDirectiveTests', () => {
	let directive, controller;
	beforeEach(module('CommonModule'));

	beforeEach(angular.mock.inject((NotificationService) => {
		directive = new ConfirmationModalDirective();
		controller = new ConfirmationModalController(NotificationService);
	}));

	it('should have all directive variables set', () => {
		expect(directive).to.exist;
		expect(directive.templateUrl).to.equal('./confirmationModal.html');
		expect(directive.restrict).to.equal('E');
		expect(directive.controllerAs).to.equal('confirmCtrl');
		expect(directive.bindToController).to.equal(true);
	});

	it('should have a controller set', () => {
		expect(directive.controller).to.be.a('function');
	});

	it('should have a controller with a defined config', () => {
		expect(directive.controller).to.be.a('function');
		expect(controller.config).to.exist;
	});
});
