(function() {
    'use strict';

    angular.module('your-position')
        .run(setUpRoutes);

    /*@ngInject*/
    function setUpRoutes(routeHelper, gettext, geolocation) {
        var stateName = gettext('Your position');
        var stateConfig = {
            url: '/your-position',
            templateUrl: 'components/your-position/your-position.html',
            title: gettext('Your position'),
            controller: 'YourPositionController'
        };

        routeHelper.registerState(stateName, stateConfig);
        routeHelper.setDefaultState(stateConfig.url);
    }
    setUpRoutes.$inject = ['routeHelper', 'gettext', 'geolocation'];
})();