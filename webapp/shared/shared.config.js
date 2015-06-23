(function() {
    'use strict';

    var sharedModule = angular.module('shared');
    sharedModule.config(configure);

    /*@ngInject*/
    configure.$inject = ['$logProvider', 'customExceptionHandlerProvider', 'routehelperConfigProvider',
        'gettext', '$urlRouterProvider', '$stateProvider', '$animateProvider'
    ];

    function configure($logProvider, customExceptionHandlerProvider, routehelperConfigProvider, gettext, $urlRouterProvider, $stateProvider) {
        sharedModule.value('config', config);
        var config = {
            appErrorPrefix: '[Previa Error]: ',
            appTitle: gettext('Previa-title/Previa kontosökning'),
            version: gettext('Previa-version/0.0.1')
        };

        // turn debugging off/on (no info or warn)
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }

        // Configure the common route provider
        routehelperConfigProvider.config.$urlRouterProvider = $urlRouterProvider;
        routehelperConfigProvider.config.$stateProvider = $stateProvider;
        routehelperConfigProvider.config.docTitle = gettext('Previa-route-title/Previa');

        // Configure the common exception handler
        customExceptionHandlerProvider.configure(config.appErrorPrefix);
    }
})();