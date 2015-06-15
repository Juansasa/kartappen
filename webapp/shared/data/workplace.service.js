(function() {
    'use strict';

    angular
        .module('data')
        .factory('offices', service);

        /*@ngInject*/
        function service($http) {
        var s = {
            all: getAll
        };
        return s;

        function getAll() {
            return $http.get('assets/resources/kontosinformation.csv');
        }
    }
})();