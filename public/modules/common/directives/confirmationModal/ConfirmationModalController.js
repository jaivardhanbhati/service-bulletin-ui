/**
 * Created by 212329930 on 11/7/16.
 */
/** @class ConfirmationModalController
 @memberof Common.directives.confirmationModal
 */
class ConfirmationModalController {
	/**
	 @function constructor
	 @param {Object} NotificationService
	 @memberof Common.directives.confirmationModal
	 */
	constructor(NotificationService) {
		this.config = NotificationService.modalConfig;
	}
}

ConfirmationModalController.$inject = ['NotificationService'];

export default ConfirmationModalController;
