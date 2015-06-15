'use strict';

var gulp = require('gulp');
var config = require('./config')();
var wiredep = require('wiredep').stream;
var $ = require('gulp-load-plugins')();

//
// Import and compile SCSS files to CSS. The order of files is assumed to be
// configs -> variables -> the rest. 
//  Configs should contains configurations of external plugins
//  Variables should contains SASS global variables which must be load before everything else
// The order of files are specified in 'gulp/config.js' file.
//

var sassCompilerOptions = {
    includePaths: require('node-bourbon').includePaths, // For bourbon-libsass support
    style: 'expanded'
};

function configFiles() {
    return gulp.src(config.scss.configurations, {
        read: false
    });
}

function helpersFiles() {
    return gulp.src(config.scss.helpers, {
        read: false
    });
}

function componentsFiles() {
    return gulp.src(config.scss.components, {
        read: false
    });
}

// Sometimes Sass plugins require config variables to be defined before the plugin is imported in
// then declare them in the config.scss.pre

function injectOptions(setting) {
    return {
        transform: function(filePath) {
            return '@import \'' + filePath + '\';';
        },
        starttag: '// import:' + setting,
        endtag: '// endimport',
        addRootSlash: false
    };
}

gulp.task('styles', function() {
    return gulp.src(config.scss.main)
        .pipe($.inject(configFiles(), injectOptions('configurations')))
        .pipe(wiredep(config.wiredepOptions))
        .pipe($.inject(helpersFiles(), injectOptions('helpers')))
        .pipe($.inject(componentsFiles(), injectOptions('components')))
        .pipe(gulp.dest(config.scss.dest))
        .pipe($.sass(sassCompilerOptions))
        .pipe($.autoprefixer())
        .on('error', function handleError(err) {
            console.error(err.toString());
            this.emit('end');
        })
        .pipe(gulp.dest(config.scss.dest));
});