(function() {
    'use strict';
    angular.module('office-search')
        .controller('ShareLocationModalController', controller);

    /*@ngInject*/
    function controller($scope, mailService, $modalInstance, office) {
		$scope.send = sendMail;
		$scope.close = closeModal;
		$scope.alerts = [];
		$scope.closeAlert = closeAlert;

		function closeAlert (index) {
			$scope.alerts.splice(index, 1);
			$modalInstance.close();
		}

		function closeModal () {
			$modalInstance.close();
		}

		function sendMail () {
			$scope.isSending = true;
			mailService.sendMail($scope.inputEmail, office)
				.then(success, failed);
		}

		function success (response) {
			$scope.isSending = false;
			$scope.sentSuccess = true;
			$scope.alerts.push({
				type: 'success',
				msg: 'Mailen är nu skickade till ' + $scope.inputEmail
			});
		}

		function failed (error) {
			$scope.isSending = false;
			$scope.sentFailed = true;
			$scope.alerts.push({
				type: 'danger',
				msg: 'Fel: Mailen kunde inte skickas, var god försök igen senare'
			});
		}
    }
})();