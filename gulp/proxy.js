'use strict';

//
// Simple proxy configuration to redirect calls to a remote backend server.
// Configure proxy settings in config.proxies to enable correct routings
//

var url = require('url');
var proxy = require('proxy-middleware');
var config = require('./config')();

function getMiddleware() {
	var middlewares = [];
	config.proxies.forEach(function(route) {
        var settings = url.parse(route.to);
        settings.route = route.from;

        middlewares.push(proxy(settings));
    });

    return middlewares;
}

module.exports = getMiddleware() || [];