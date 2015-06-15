'use strict';

var gulp = require('gulp');
var config = require('./config')();
var util = require('util');
var browserSync = require('browser-sync');
var middleware = require('./proxy');

function browserSyncInit(baseDir, files, browser) {
    browser = browser === undefined ? 'default' : browser;
    var routes = null;

    // Make sure bower_components is correctly routed
    if (baseDir === config.webapp || (util.isArray(baseDir) && baseDir.indexOf(config.webapp) !== -1)) {
        routes = {
            '/bower_components': 'bower_components'
        };
    }

    if (browserSync.active) {
            return;
        }
        var options = {
            port: 9000,
            startPath: '/',
            server: {
                baseDir: baseDir,
                //directory: true,
                middleware: middleware,
                routes: routes
            },
            files: files || [],
            watchOptions: {
                debounceDelay: 1000
            },
            ghostMode: {
                clicks: true,
                forms: true,
                scroll: true,
                location: false
            },
            injectChanges: true,
            logFileChanges: true,
            logLevel: 'debug',
            logPrefix: 'gulp-patterns',
            notify: true,
            browser: browser
        };
        browserSync(options);
}

gulp.task('serve', ['watch'], function() {
    browserSyncInit([
        config.serve,
        config.webapp
    ], [config.serve + '/**/*.{js,html,css}']);
});

gulp.task('serve:dist', ['build'], function() {
    browserSyncInit(config.dist);
});