(function() {
    'use strict';

    angular.module('your-position')
        .service('locationService', locationService);

    /*@ngInject*/
    function locationService($q) {        
        var service = {
            getAllOffices: getAllOffices
        };


        return service;

        // Replace with server calls
        function getAllOffices() {
            var mockOffices = [{
                name: 'Gullmarsplan',
                box: '',
                postalNumber: '121 40',
                city: 'Johanneshov',
                street: 'Gullmarsplan 17',

                tel: '0771-23 00 00',
                fax: '08-722 24 38',
                email: 'gullmarsplan@previa.se',
                contactPersons: [{
                    fullname: 'Sanna Ankarcrona',
                    role: 'Konsultchef',
                    tel: '08-722 2424',
                    fax: null,
                    email: 'sanna.ankarcrona@previa.se'
                }, {
                    fullname: 'Marie-Louise Stoor',
                    role: 'Administration & Service',
                    tel: '08-722 24 15',
                    fax: '08-722 24 38',
                    email: 'marie-louise.stoor@previa.se'
                }],
                markerIcon: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-48.png'
            }, {
                name: 'Huvudkontor',
                box: 'Box 6047',
                postalNumber: '102 31',
                city: 'Stockholm',
                street: 'S:t Eriksgatan 113',
                tel: '0771-23 00 00',
                fax: '08-627 43 99',
                email: 'info@previa.se',
                contactPersons: [],
                markerIcon: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-48.png'
            }];

            var deferred = $q.defer();
            deferred.resolve(mockOffices);
            return deferred.promise;
        }
    }
})();