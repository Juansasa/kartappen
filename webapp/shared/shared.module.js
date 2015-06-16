(function() {
    'use strict';
    /**
     * Shared Module
     *
     * This module include all common utilities modules used accross the app.
     */
    angular.module('shared', [
        'gettext',
        'ngAnimate',
        'ngCookies',
        'ngSanitize',
        'ngResource',
        'ui.bootstrap',
        'geolocation', 
        'angularSpinner', 
        'ngMap',
        'exception',
        'router',
        'data',
        'widgets'
    ]).run(['gettextCatalog',
        function(gettextCatalog) {
            $.stellar({
                horizontalScrolling: false,
                responsive: true
            });
            gettextCatalog.currentLanguage = 'sv';
            //gettextCatalog.debug = true;
        }
    ]);
})();