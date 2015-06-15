(function() {
    'use strict';

    angular
        .module('exception')
        .provider('customExceptionHandler', exceptionHandlerProvider)
        .config(config);

    function exceptionHandlerProvider() {
        /* jshint validthis:true */
        this.config = {
            appErrorPrefix: undefined
        };

        this.configure = function (appErrorPrefix) {
            this.config.appErrorPrefix = appErrorPrefix;
        };

        this.$get = function() {
            return {config: this.config};
        };
    }
    
    /*@ngInject*/
    function config($provide) {
        $provide.decorator('$exceptionHandler', extendExceptionHandler);
    }
    config.$inject = ['$provide'];

    /*@ngInject*/
    function extendExceptionHandler($delegate, customExceptionHandler, logger) {
        return function(exception, cause) {
            var appErrorPrefix = customExceptionHandler.config.appErrorPrefix || '';
            var errorData = {exception: exception, cause: cause};
            exception.message = appErrorPrefix + exception.message;
            $delegate(exception, cause);
            /**
                TODO handle errors here.
             */
            logger.error(exception.message, errorData);
        };
    }
    extendExceptionHandler.$inject = ['$delegate', 'customExceptionHandler', 'logger'];
})();
