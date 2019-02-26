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

const polymerBuilds = require('./build-helpers/polymer-builds');
const fsHelper = require('./build-helpers/file-system-helper');

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
  spawn('tsc', ['--watch'], spawnOptions);
  spawn('polymer', ['serve -H 0.0.0.0 -p 8080'], spawnOptions);
});


/**
 * Gulp build task for esm-bundle
 */
gulp.task('build_esm_bundle', (done) => {
  polymerBuilds.buildEsmBundled(done);//, fsHelper.mergeTempBuildFolders, done);

});

// TODO: might be removed
gulp.task('merge_folders', () => {
  return fsHelper.mergeTempBuildFolders('esm-bundled');
});



/**
 * TODOs:
 *  - apply single responsability
 *  - move helper functions in a separate file for a better structure
 *  - split fragments set builds from folders merging
 *      - remove code block containing `return mergeTempBuildFolders(buildName);`
 *      - create a new task for removing build_temp folder (see rmTempBuildFolder spawn)
 *      - new gulp task using  gulp.series('build_esm_bundle', 'merge_folders', 'remove_build_temp_folder')
 * - build cmd generation improvements
 * - tasks for es6 and es5
 */
