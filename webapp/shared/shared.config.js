(function() {
    'use strict';

    var sharedModule = angular.module('shared');
    sharedModule.config(configure);

    /*@ngInject*/
    configure.$inject = ['$logProvider', 'customExceptionHandlerProvider', 'routehelperConfigProvider',
        'gettext', '$urlRouterProvider', '$stateProvider', '$animateProvider'
    ];

    function configure($logProvider, customExceptionHandlerProvider, routehelperConfigProvider, gettext, $urlRouterProvider, $stateProvider, $animateProvider) {
        sharedModule.value('config', config);
        var config = {
            appErrorPrefix: '[FMU Error]: ',
            appTitle: gettext('fmu-title/Fördjupad medicinsk utredning'),
            version: gettext('fmu-version/0.0.1')
        };

        // turn debugging off/on (no info or warn)
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }

        // Configure the common route provider
        routehelperConfigProvider.config.$urlRouterProvider = $urlRouterProvider;
        routehelperConfigProvider.config.$stateProvider = $stateProvider;
        routehelperConfigProvider.config.docTitle = gettext('fmu-route-title/Fmu');

        // Configure the common exception handler
        customExceptionHandlerProvider.configure(config.appErrorPrefix);

        // restrict animation to elements with the bi-animate css class with a regexp.
        $animateProvider.classNameFilter(/^((?!(fa-spin)).)*$/);
    }
})();