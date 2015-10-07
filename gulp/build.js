'use strict';

var gulp = require('gulp');
var config = require('./config')();
var plugins = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('partials', function() {
    return gulp.src(config.templatecache.files)
        .pipe(plugins.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(plugins.angularTemplatecache('templateCacheHtml.js', {
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

    var htmlFilter = plugins.filter('*.html');
    var jsFilter = plugins.filter('**/*.js');
    var cssFilter = plugins.filter('**/*.css');
    var assets;

    return gulp.src(config.serve + '/*.html')
        .pipe(plugins.inject(partialsInjectFile, partialsInjectOptions))
        .pipe(assets = plugins.useref.assets())
        .pipe(plugins.rev())
        .pipe(jsFilter)
        .pipe(plugins.ngAnnotate())
        .pipe(plugins.uglify({
            preserveComments: plugins.uglifySaveLicense
        }))
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe(plugins.replace('../bootstrap-sass-official/assets/fonts/bootstrap', '../fonts'))
        .pipe(plugins.csso())
        .pipe(cssFilter.restore())
        .pipe(assets.restore())
        .pipe(plugins.useref())
        .pipe(plugins.revReplace())
        .pipe(htmlFilter)
        .pipe(plugins.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(htmlFilter.restore())
        .pipe(gulp.dest(config.dist))
        .pipe(plugins.size({
            title: config.dist,
            showFiles: true
        }));
});

gulp.task('images', function() {
    return gulp.src(config.images.files)
        .pipe(gulp.dest(config.images.dest));
});

gulp.task('fonts-dev', function() {
    return gulp.src(config.fonts.files)
        .pipe(plugins.filter('**/*.{eot,svg,ttf,woff,woff2}'))
        .pipe(plugins.flatten())
        .pipe(gulp.dest(config.fonts.dev));
});

gulp.task('fonts-prod', ['fonts-dev'], function() {
    return gulp.src([config.fonts.dev + '/**'])
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
    plugins.del([config.dist, config.tmp], done);
});

gulp.task('build', ['html', 'images', 'fonts-prod', 'misc', 'resources']);