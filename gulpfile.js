'use strict';

require('es6-promise').polyfill();

var gulp = require('gulp-help')(require('gulp'));
var $ = require('gulp-load-plugins')();
var _ = require('lodash');
var browserSync = require('browser-sync');
var clear = require('clear');
var colors = require('colors');
var crypto = require('crypto');
var del = require('del');
var ensureFiles = require('./tasks/ensure-files.js');
var fs = require('fs');
var ftp = require('vinyl-ftp');
var glob = require('glob-all');
var gutil = require('gulp-util');
var historyApiFallback = require('connect-history-api-fallback');
var merge = require('merge-stream');
var packageJson = require('./package.json');
var path = require('path');
var reload = browserSync.reload;
var replace = require('gulp-replace-task');
var runSequence = require('run-sequence');

// parse arguments
var args = require('yargs')
    .alias('env', 'environment')
    .default('environment', 'prod')
    .argv;

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

var DIST = 'dist';

var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};

var styleTask = function(stylesPath, srcs) {
  return gulp.src(srcs.map(function(src) {
      return path.join('app', stylesPath, src);
    }))
    .pipe($.changed(stylesPath, {extension: '.css'}))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/' + stylesPath))
    .pipe($.minifyCss())
    .pipe(gulp.dest(dist(stylesPath)))
    .pipe($.size({title: stylesPath}));
};

var imageOptimizeTask = function(src, dest) {
  return gulp.src(src)
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(dest))
    .pipe($.size({title: 'images'}));
};

var optimizeHtmlTask = function(src, dest) {
  var assets = $.useref.assets({
    searchPath: ['.tmp', 'app']
  });

  return gulp.src(src)
    .pipe(assets)
    // Concatenate and minify JavaScript
    .pipe($.if('*.js', $.uglify({
      preserveComments: false
    })))
    // Concatenate and minify styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.minifyCss()))
    .pipe(assets.restore())
    .pipe($.useref())
    // Minify any HTML
    .pipe($.if('*.html', $.htmlmin({
      collapseWhitespace: true,
      preserveLineBreaks: false,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true
    })))
    // Output files
    .pipe(gulp.dest(dest))
    .pipe($.size({
      title: 'html'
    }));
};

// Compile and automatically prefix stylesheets
gulp.task('styles', function() {
  return styleTask('styles', ['**/*.css']);
});

// Ensure that we are not missing required files for the project
// "dot" files are specifically tricky due to them being hidden on
// some systems.
gulp.task('ensureFiles', function(cb) {
  var requiredFiles = ['.bowerrc'];

  ensureFiles(requiredFiles.map(function(p) {
    return path.join(__dirname, p);
  }), cb);
});

// Optimize images
gulp.task('images', function() {
  return imageOptimizeTask('app/images/**/*', dist('images'));
});

// Copy all files at the root level (app)
gulp.task('copy', function() {
  var app = gulp.src([
    'app/*',
    '!app/test',
    '!app/elements',
    '!app/bower_components',
    '!app/cache-config.json',
    '!**/.DS_Store'
  ], {
    dot: true
  }).pipe(gulp.dest(dist()));

  // Copy over only the bower_components we need
  // These are things which cannot be vulcanized
  // var bower = gulp.src([
  //   'app/bower_components/{webcomponentsjs,platinum-sw,sw-toolbox,promise-polyfill}/**/*'
  // ]).pipe(gulp.dest(dist('bower_components')));

  var bower = [];

  return merge(app, bower)
    .pipe($.size({
      title: 'copy'
    }));
});

// Copy web fonts to dist
gulp.task('fonts', function() {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest(dist('fonts')))
    .pipe($.size({
      title: 'fonts'
    }));
});

gulp.task('data', function() {
  return gulp.src(['app/data/**'])
    .pipe(gulp.dest(dist('data')))
    .pipe($.size({
      title: 'data'
    }));
});

// Lint JavaScript
gulp.task('lint', function() {
  return gulp.src([
      'app/scripts/**/*.js',
      'app/elements/**/*.js',
      'app/elements/**/*.html',
      'gulpfile.js'
    ])
    .pipe(reload({
      stream: true,
      once: true
    }))

  // JSCS has not yet a extract option
  .pipe($.if('*.html', $.htmlExtract({'strip': true})))
  .pipe(gulp.dest('tmp'))
  .pipe($.jshint())
  .pipe($.jscs())
  .pipe($.jscsStylish.combineWithHintResults())
  .pipe($.jshint.reporter('jshint-stylish'))
  .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));

});

// Scan your HTML for assets & optimize them
gulp.task('html', function() {
  return optimizeHtmlTask(
    ['app/**/*.html', '!app/{elements,test,bower_components}/**/*.html'],
    dist());
});

// Vulcanize granular configuration
gulp.task('vulcanize', function() {
  return gulp.src('app/elements/elements.html')
    .pipe($.vulcanize({
      stripComments: true,
      inlineCss: true,
      inlineScripts: true
    }))
    //.pipe($.minifyInline(options))
    .pipe($.htmlmin({
      collapseWhitespace: true,
      preserveLineBreaks: false,
      minifyCSS: false,
      minifyJS: true,
      removeComments: true
    }))
    .pipe(gulp.dest(dist('elements')))
    .pipe($.size({title: 'vulcanize'}));
});

// Generate config data for the <sw-precache-cache> element.
// This include a list of files that should be precached, as well as a (hopefully unique) cache
// id that ensure that multiple PSK projects don't share the same Cache Storage.
// This task does not run by default, but if you are interested in using service worker caching
// in your project, please enable it within the 'default' task.
// See https://github.com/PolymerElements/polymer-starter-kit#enable-service-worker-support
// for more context.
gulp.task('cache-config', function(callback) {
  var dir = dist();
  var config = {
    cacheId: packageJson.name || path.basename(__dirname),
    disabled: false
  };

  glob([
    'index.html',
    './',
    'bower_components/webcomponentsjs/webcomponents-lite.min.js',
    '{elements,scripts,styles}/**/*.*'],
    {cwd: dir}, function(error, files) {
    if (error) {
      callback(error);
    } else {
      config.precache = files;

      var md5 = crypto.createHash('md5');
      md5.update(JSON.stringify(config.precache));
      config.precacheFingerprint = md5.digest('hex');

      var configPath = path.join(dir, 'cache-config.json');
      fs.writeFile(configPath, JSON.stringify(config), callback);
    }
  });
});

// Clean output directory
gulp.task('clean', function() {
  return del(['.tmp', dist(), 'tmp']);
});

// Watch files for changes & reload
gulp.task('serve', ['styles'], function() {
  browserSync({
    port: 5000,
    notify: false,
    logPrefix: 'etools_partnership_management',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: ['.tmp', 'app'],
      middleware: [historyApiFallback()]
    }
  });

  gulp.watch(['app/**/*.html', '!app/bower_components/**/*.html'], reload);
  gulp.watch(['app/styles/**/*.css'], ['styles', reload]);
  gulp.watch(['app/scripts/**/*.js'], reload);
  gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function() {
  browserSync({
    port: 5001,
    notify: false,
    logPrefix: 'etools_partnership_management',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: dist(),
    middleware: [historyApiFallback()]
  });
});

// Build production files, the default task
gulp.task('default', ['clean'], function(cb) {
  // Uncomment 'cache-config' if you are going to use service workers.
  runSequence(
    'lint',
    'update_constants_app',
    ['ensureFiles', 'copy', 'styles'],
    ['images', 'fonts', 'html', 'data'],
    'vulcanize', // 'cache-config',
    cb);
});

// Build then deploy to GitHub pages gh-pages branch
gulp.task('build-deploy-gh-pages', function(cb) {
  runSequence(
    'default',
    'deploy-gh-pages',
    cb);
});

// Deploy to GitHub pages gh-pages branch
gulp.task('deploy-gh-pages', function() {
  return gulp.src(dist('**/*'))
    // Check if running task from Travis CI, if so run using GH_TOKEN
    // otherwise run using ghPages defaults.
    .pipe($.if(process.env.TRAVIS === 'true', $.ghPages({
      remoteUrl: 'https://$GH_TOKEN@github.com/polymerelements/polymer-starter-kit.git',
      silent: true,
      branch: 'gh-pages'
    }), $.ghPages()));
});

gulp.task('deploy-dev-azure', function() {

  clear();
  console.log(colors.underline.bold.white('eTools Deploy: Azure Web App'));

  var requiredEnvironmentVariables = ['AZURE_FTP_HOSTNAME', 'AZURE_FTP_DEPLOYMENT_USERNAME', 'AZURE_FTP_DEPLOYMENT_PASSWORD'];
  var missingEnvironmentVariables = _.difference(requiredEnvironmentVariables, _.keys(process.env));

  if (missingEnvironmentVariables.length > 0) {
    console.log(colors.bold.red('\nERROR:'));
    console.log(colors.red('Environment variables missing:' + missingEnvironmentVariables));
    console.log('');
    return false;
  }

  var conn = ftp.create({
    host:     process.env.AZURE_FTP_HOSTNAME,
    user:     process.env.AZURE_FTP_DEPLOYMENT_USERNAME,
    password: process.env.AZURE_FTP_DEPLOYMENT_PASSWORD,
    parallel: 10,
    log: gutil.log
  });

  var globs = [
    'dist/**'
  ];

  return gulp.src(globs, {buffer: true})
      .pipe(conn.dest('/site/wwwroot'));
});

gulp.task('update_constants_app', function() {
  var env = args.env || 'prod';
  var filename = env + '.json';
  var settings = JSON.parse(fs.readFileSync('./config/' + filename, 'utf8'));
  return updateConstants(settings);
});

function updateConstants(settings) {
  return gulp.src('app/scripts/app.constants.template.js')
    .pipe(replace({
      patterns: _.map(_.keys(settings), function(key) {
            return {match: key, replacement: settings[key]};
          })
    }))
    .pipe($.rename('app.constants.js'))
    .pipe(gulp.dest('app/scripts'))
    .on('error', handleError);
}

function handleError(err) {
  console.log(err.toString());
  process.exit(-1);
}

// Load tasks for web-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
require('web-component-tester').gulp.init(gulp);

// Load custom tasks from the `tasks` directory
try {
  require('require-dir')('tasks');
} catch (err) {
  // Do nothing
}
