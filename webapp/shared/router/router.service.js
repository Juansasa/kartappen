(function() {
    'use strict';
    angular.module('router')
        .provider('routehelperConfig', routehelperConfig)
        .factory('routeHelper', routeHelper);

    function routehelperConfig() {
        /* jshint validthis:true */
        this.config = {
            // These are the properties we need to set
            // $urlRouterProvider: undefined
            // $stateProvider: undefined
            // defaultState: '/'
            // docTitle: ''
        };

        this.$get = function() {
            return {
                config: this.config
            };
        };
    }

    /*@ngInject*/
    function routeHelper($rootScope, logger, routehelperConfig) {
        var service = {
            registerState: registerState,
            registerStates: registerStates,
            setDefaultState: setDefaultState
        };

        init();
        return service;

        function registerStates(routeStates) {
            var routes;
            _.forEach(routeStates, function(state) {
                if(!routes) {
                    routes = registerState(state.stateName, state.stateConfig);
                } else {
                    routes.state(state.stateName, state.stateConfig);
                }
            });
        }

        function registerState(stateName, stateConfig) {
            return routehelperConfig.config.$stateProvider
                .state(stateName, stateConfig);
        }

        function setDefaultState(statePath) {
            routehelperConfig.config.defaultState = statePath || '/';
            routehelperConfig.config.$urlRouterProvider.otherwise('' + routehelperConfig.config.defaultState);
        }

        function init() {
            handleErrors();
            updateTitle();
        }

        function handleErrors() {
            $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
                logger.error('Failed to route', {
                    event: event, 
                    toState: toState, 
                    toParams: toParams, 
                    fromState: fromState, 
                    fromParams: fromParams,
                    error: error
                });
            });
        }

        function updateTitle() {
            $rootScope.$on('$stateChangeSuccess',
                function(event, toState) {
                    var title = (toState.title || 'Fmu');
                    $rootScope.title = title;
                });
        }
    }
    routeHelper.$inject = ['$rootScope', 'logger', 'routehelperConfig'];

})();