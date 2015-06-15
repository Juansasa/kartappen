'use strict';

//
// Translation can't be done automatically but normally consists of 3 steps
// 1. Extraction to .pot file
// 2. Actual translation using a .pot editor and save the results to a .po file
// 3. Compile the transtation .po file to an angular module ('translation' is the default module name) 
// NOTE. Read docs at https://angular-gettext.rocketeer.be/ for more infomations about how translation works
//

var gulp = require('gulp');
var config = require('./config')();
var $ = require('gulp-load-plugins')();

gulp.task('extract-pot', function() {
    return gulp.src(config.translation.files)
        .pipe($.angularGettext.extract('translation.pot', {}))
        .pipe(gulp.dest(config.translation.dir));
});

gulp.task('compile-po', function() {
    return gulp.src(config.translation.dir + '/*.pot')
        .pipe($.angularGettext.compile({
            module: config.translation.modulename
            // Do this if translation file is too big
                // format: 'json'
        }))
        .pipe(gulp.dest(config.translation.dest));
});