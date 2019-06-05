/* eslint-disable */


/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

const gulp = require('gulp');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const del = require('del');
const spawn = require('child_process').spawn;
const polymerBuilds = require('./build_helpers/polymer-builds');
const fileSystemHelper = require('./build_helpers/file-system-helper');
const buildWithPolymerLib = require('./build_helpers/polymer-build-library');

//const through2 = require('through2').obj;
//let uglify = require('gulp-uglify-es').default;
//let uglify = require('babel-preset-minify');

// const uglify = require('gulp-uglify');
// const cssSlam = require('css-slam').gulp;
// const htmlMinifier = require('gulp-html-minifier');


// ---------------------------------------------------------------------------------

/**
 * Cleans the prpl-server build in the server directory.
 */
gulp.task('prpl-server:clean', () => {
  return del('server/build');
});

/**
 * Copies the prpl-server build to the server directory while renaming the
 * node_modules directory so services like App Engine will upload it.
 */
gulp.task('prpl-server:build', () => {
  const pattern = 'node_modules';
  const replacement = 'node_assets';

  return gulp.src('build/**')
    .pipe(rename(((path) => {
      path.basename = path.basename.replace(pattern, replacement);
      path.dirname = path.dirname.replace(pattern, replacement);
    })))
    .pipe(replace(pattern, replacement))
    .pipe(gulp.dest('server/build'));
});

gulp.task('prpl-server', gulp.series(
  'prpl-server:clean',
  'prpl-server:build'
));

const spawnOptions = {
  // `shell` option for Windows compatability. See:
  // https://nodejs.org/api/child_process.html#child_process_spawning_bat_and_cmd_files_on_windows
  shell: true,
  stdio: 'inherit'
};
/**
 * Gulp task to run `tsc --watch` and `polymer serve` in parallel.
 */
gulp.task('serve', () => {
  spawn('tsc --skipLibCheck', ['--watch'], spawnOptions);
  spawn('polymer', ['serve -H 0.0.0.0 -p 8080'], spawnOptions);
});

gulp.task('buildEsmBundled', (done) => {
  polymerBuilds.buildEsmBundled(done);
});

gulp.task('buildEs6Bundled', (done) => {
  polymerBuilds.buildEs6Bundled(done);
});

gulp.task('buildEs5Bundled', (done) => {
  polymerBuilds.buildEs5Bundled(done);
});

gulp.task('moveTempToBuildFolder', (done) => {
  fileSystemHelper.moveTempToBuildFolder().then(() => {
    done();
  });
});

gulp.task('build-with-lib', gulp.series(buildWithPolymerLib.deleteBuildDirectory,
  gulp.parallel(buildWithPolymerLib.build, buildWithPolymerLib.generateServiceWorker),
  buildWithPolymerLib.moveServiceWorker));

gulp.task('build1by1', gulp.series(polymerBuilds.buildEsmBundled, polymerBuilds.buildEs6Bundled,
polymerBuilds.buildEs5Bundled));


