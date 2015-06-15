(function() {
    'use strict';

    angular.module('data')
        .filter('valid', validOffices);

    /*@ngInject*/
    function validOffices() {
        return function(input) {
            return _.reject(input, hasFilial);
        };

        function hasFilial(item) {
            return !item.Filial;
        }
    }
})();