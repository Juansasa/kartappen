(function() {
    'use strict';

    angular.module('data')
        .filter('valid', validOffices);

    /*@ngInject*/
    function validOffices() {
        return function(input) {
            return _.filter(input, hasFilialAndValidMO);
        };

        function hasFilialAndValidMO(item) {
            return item.Filial && _.startsWith(item.Distrikt.trim().toLowerCase(), 'mo');
        }
    }
})();