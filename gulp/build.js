'use strict';

var gulp = require('gulp');
var config = require('./config')();
var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('partials', function() {
    return gulp.src(config.templatecache.files)
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe($.angularTemplatecache('templateCacheHtml.js', {
            module: config.templatecache.moduleName
        }))
        .pipe(gulp.dest(config.templatecache.dest));
});

gulp.task('html', ['inject', 'partials'], function() {
    var partialsInjectFile = gulp.src(config.templatecache.dest + '/*.js', {
        read: false
    });
    var partialsInjectOptions = {
        starttag: '<!-- inject:partials -->',
        ignorePath: config.templatecache.dest,
        addRootSlash: false
    };

    var htmlFilter = $.filter('*.html');
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');
    var assets;

    return gulp.src(config.serve + '/*.html')
        .pipe($.inject(partialsInjectFile, partialsInjectOptions))
        .pipe(assets = $.useref.assets())
        .pipe($.rev())
        .pipe(jsFilter)
        .pipe($.ngAnnotate())
        .pipe($.uglify({
            preserveComments: $.uglifySaveLicense
        }))
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.replace('../bootstrap-sass-official/assets/fonts/bootstrap', 'fonts'))
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe(htmlFilter)
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(htmlFilter.restore())
        .pipe(gulp.dest(config.dist))
        .pipe($.size({
            title: config.dist,
            showFiles: true
        }));
});

gulp.task('images', function() {
    return gulp.src(config.images.files)
        .pipe(gulp.dest(config.images.dest));
});

gulp.task('fonts', function() {
    return gulp.src(config.fonts.files)
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest(config.fonts.dest));
});

gulp.task('resources', function() {
    return gulp.src(config.resources.files)
        .pipe(gulp.dest(config.resources.dest));
});

gulp.task('misc', function() {
    return gulp.src(config.misc.files)
        .pipe(gulp.dest(config.dist));
});

gulp.task('clean', function(done) {
    $.del([config.dist, config.tmp], done);
});

gulp.task('build', ['html', 'images', 'fonts', 'misc', 'resources']);