'use strict';

var gulp = require('gulp');
var config = require('./config')();

gulp.task('watch', ['inject'], function() {
    gulp.watch([
        config.webapp + '/**/*.html',
        config.webapp + '/**/*.scss',
        config.webapp + '/**/*.js',
        'bower.json'
    ], ['inject']);
});