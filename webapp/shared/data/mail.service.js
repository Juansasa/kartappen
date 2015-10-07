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
            var directionUrl = 'http://google.com/maps/?daddr=' + office.geocodeAddress.lat + ',' + office.geocodeAddress.lng;
            var displayMsg = 'Här är vägbeskrivningen till Previas konto ';

            var emails = [{
                fromAddress: 'kartappen@previa.se',
                toAddress: [reciever],
                subject: 'Previaenhet ' + office.Resultatenhetnamn || office.Filialnamn,
                body: '<div><b>' + displayMsg + '</b>: <a href="' + directionUrl + '">' + office.Resultatenhetnamn || office.Filialnamn + '</a></div>'
            }];

            return $http.post('/api/ad/sendmail', {
                email: emails
            });
        }
    }
})();