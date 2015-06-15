'use strict';

// Extract the module name from package.json
var appModuleName = require('./../package').name;

module.exports = function() {
    var appPath = 'webapp';
    var tmp = '.tmp';
    var dist = 'dist';
    var assets = appPath + '/assets';
    var bowerDir = './bower_components';
    var serveDir = tmp;
    var unittestDir = './unit-tests';

    var config = {
        webapp: appPath,
        tmp: tmp,
        serve: serveDir,
        dist: dist,

        scss: {
            main: appPath + '/index.scss',
            configurations: assets + '/sass/configs/**/_*.scss',
            helpers: [
                assets + '/sass/functions/**/_*.scss',
                assets + '/sass/mixins/**/_*.scss'
            ],
            components: [
                appPath + '/**/_main.scss', //Make sure the main.scss file is loaded first
                appPath + '/**/*.scss',
                '!' + assets + '/**/*',
                '!' + appPath + '/index.scss'
            ],
            dest: tmp
        },

        css: {
            files: [
                appPath + '/**/*.css',
                tmp + '/**/*.css'
            ]
        },

        js: {
            files: [
                // ordering of modules is handled by angular-filesort plugin
                appPath + '/**/*.js',
                appPath + '/**/*.constant.js',
                appPath + '/**/*.service.js',
                appPath + '/**/*.controller.js',
                appPath + '/**/*.js',
                '!' + appPath + '/**/*.mock.js',
                '!' + appPath + '/**/*.spec.js',
            ]
        },

        images: {
            files: [assets + '/images/**'],
            dest: dist + '/assets/images'
        },

        fonts: {
            files: [assets + '/fonts/**', bowerDir + '/**'],
            dest: dist + '/fonts/'
        },

        misc: {
            files: [appPath + '/*.{ico,txt}', appPath + '/.htaccess']
        },

        templatecache: {
            files: [
                appPath + '/**/*.html',
                tmp + '/**/*.html'
            ],
            dest: tmp + '/partials',
            moduleName: appModuleName
        },

        translation: {
            dir: assets + '/text-entries',
            files: [appPath + '/**/*.{html,js}'],
            dest: appPath + '/shared/translation',
            modulename: appModuleName
        },

        karmaconfig: {
            dir: unittestDir,
            configfile: unittestDir + '/karma.conf.js',
        },

        proxies: [{
            from: '/api/user',
            to: 'http://test.com/user' // Just an example backend proxy
        }],

        wiredepOptions: {
            bowerJson: require('./../bower.json'),
            directory: bowerDir,
            devDependencies: true,
            exclude: [ /bootstrap-sass/, /bootstrap\.css/, /bootstrap\.css/, /foundation\.css/]
        }
    };

    return config;
};