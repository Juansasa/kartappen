'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var wiredep = require('wiredep');
var config = require('./config')();

function runTests(singleRun, done) {
    var bowerDeps = wiredep({
        directory: 'bower_components',
        exclude: ['bootstrap-sass-official'],
        dependencies: true,
        devDependencies: true
    });

    var testFiles = bowerDeps.js.concat([
        config.webapp + '/**/*.module.js',
        config.webapp + '/**/*.constant.js',
        config.webapp + '/**/*.service.js',
        config.webapp + '/**/*.spec.js',
        config.webapp + '/**/*.js'
    ]);

    function karmaCompleted(karmaResult) {
        if (karmaResult === 1) {
            done('Karma test failed with code: ' + karmaResult);
        } else {
            done();
        }
    }

    gulp.src(testFiles)
        .pipe($.print())
        .pipe($.karma({
            configFile: config.karmaconfig.configfile,
            action: (singleRun) ? 'run' : 'watch'
        }, karmaCompleted));
}

gulp.task('karma', function(done) {
    runTests(true /* singleRun */ , done);
});
gulp.task('tdd', function(done) {
    runTests(false /* singleRun */ , done);
});