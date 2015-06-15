(function() {
    'use strict';

    angular.module('data')
        .filter('MO', uniqMO);

    /*@ngInject*/
    function uniqMO() {
        return function(input) {
            return _.chain(input).pluck('Distrikt').uniq().value();
        };
    }
})();