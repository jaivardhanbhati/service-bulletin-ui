import 'angular-toastr';

/**
 * @class NotificationService
 * @memberof Common
*/
class NotificationService {
	/**
	 * @function constructor
	 * @param {Object} toastr
	 * @param {Object} $q
	 * @memberof Common.NotificationService
	 */
	constructor(toastr, $q) {
		this.toastr = toastr;
		this.$q = $q;
		/* Since the confirmation modal is designed to be re-used, create one config that is shared */
		this.modalConfig = {
			positiveText: 'Confirm',
			negativeText: 'Cancel',
			title: 'Confirm',
			contents: 'Are you sure?'
		};
	}

	/**
	 * @function notifySuccess
	 * @param {Object} message
	 * @memberof Common.NotificationService
	 */
	notifySuccess(message) {
		if (message) {
			this.toastr.success(message, { timeOut: 1000 });
		} else {
			this.toastr.success('Saved', { timeOut: 1000 });
		}
	}

	/**
	 * @function notifyFailure
	 * @param {String} errorTitle
	 * @param {String} errorMessage
	 * @memberof Common.NotificationService
	 */
	notifyFailure(errorTitle, errorMessage) {
		this.toastr.error(errorTitle, errorMessage);
	}
	/**
	 * @function confirmAction
	 * @param {String} message The text to be displayed in the modal
	 * @param {String} title The title displayed in the modal dialog
	 * @param {String} confirmText
	 * @param {String} cancelText
	 * @returns {Object} promise
	 * @memberof Common.NotificationService
	 */
	confirmAction(message, title = 'Confirm', confirmText = 'Confirm', cancelText = 'Cancel') {
		if (this.modalConfig.openModal) {
			return this.$q.reject('Modal is already open');
		}
		let deferred = this.$q.defer();
		this.modalConfig.contents = message;
		this.modalConfig.title = title;
		this.modalConfig.positiveText = confirmText;
		this.modalConfig.negativeText = cancelText;
		this.modalConfig.openModal = true;
		this.modalConfig.onConfirm = () => {
			this.modalConfig.openModal = false;
			deferred.resolve(true);
		};
		this.modalConfig.onCancel = () => {
			this.modalConfig.openModal = false;
			deferred.resolve(false);
		};

		return deferred.promise;
	}
}

NotificationService.$inject = ['toastr'];
export default NotificationService;
