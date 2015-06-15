(function() {
    'use strict';

    angular.module('mapJ')
        .run(setUpRoutes);

    /*@ngInject*/
    function setUpRoutes(routeHelper, gettext) {
        var stateName = 'mapJ';
        var stateConfig = {
            url: '/mapJ',
            templateUrl: 'components/mapJ/mapJ.html',
            title: gettext('MapJ'),
            controller: 'MapJController'
        };

        routeHelper.registerState(stateName, stateConfig);
        routeHelper.setDefaultState(stateConfig.url);
    }
    setUpRoutes.$inject = ['routeHelper', 'gettext'];
})();