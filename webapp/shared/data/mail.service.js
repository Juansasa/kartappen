'use strict';

(function() {
    angular
        .module('data')
        .factory('mailService', mailService);

    /*@ngInject*/
    function mailService($http) {
        var service = {
            sendMail: send
        };
        return service;

        function send(reciever, office) {
            console.log(reciever, office);
            
            var emails = [{
                fromAddress: 'kartappen@previa.se',
                toAddress: [reciever],
                subject: '' + office.geocodeAddress.formattedAddress,
                body: 'Adress till Previas konto ' + office.Resultatenhetnamn || office.Filialnamn
            }];

            return $http.post('/api/ad/sendmail', {
                email: emails
            });
        }
    }
})();