(function() {
    'use strict';

    angular.module('office-search')
        .run(setUpRoutes);

    /*@ngInject*/
    function setUpRoutes(routeHelper, gettext) {
        var stateName = gettext('office-search');
        var stateConfig = {
            url: '/kontorsokning',
            templateUrl: 'components/office-search/template.html',
            title: gettext('Kontorsökning'),
            controller: 'OfficeSearchController'
        };

        routeHelper.registerState(stateName, stateConfig);
        routeHelper.setDefaultState(stateConfig.url);
    }
    setUpRoutes.$inject = ['routeHelper', 'gettext'];
})();