import ConfirmationModalController from './ConfirmationModalController';
/**
 * @class ConfirmationModalDirective
 * @memberof Common.directives.confirmationModal
 */
class ConfirmationModalDirective {
	/**
	 @function constructor
	 @param {object} $log Angular logging
	 @memberof Common.directives.confirmationModal
	 */
	constructor($log) {
		this.templateUrl = './confirmationModal.html';
		this.restrict = 'E';
		this.controller = ConfirmationModalController;
		this.controllerAs = 'confirmCtrl';
		this.bindToController = true;
		this.link = (scope, element, attr, ctrl) => {
			const pxModal = element.find('px-modal');
			if (pxModal && pxModal[0]) {
				const pxModalEl = pxModal[0];
				scope.$watch(() => ctrl.config, (newConfig) => {
					if (newConfig && newConfig.openModal) {
						pxModalEl.modalButtonClicked();
					}
				}, true);

				pxModalEl.addEventListener('btnModalPositiveClicked', (e) => {
					if (ctrl.config.onConfirm) {
						ctrl.config.onConfirm({ message: 'Confirmed' });
					} else {
						$log('No onConfirm function defined');
					}
				});

				pxModalEl.addEventListener('btnModalNegativeClicked', (e) => {
					if (ctrl.config.onCancel) {
						ctrl.config.onCancel({ message: 'Cancelled' });
					} else {
						$log('No onCancel function defined');
					}
				});
			}
		};
	}
}

ConfirmationModalDirective.$inject = ['$log'];

export default ConfirmationModalDirective;
