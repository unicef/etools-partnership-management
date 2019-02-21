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
gulp.task('build_esm_bundle', () => {
  // Promise is used to avoid error:
  //    `The following tasks did not complete: build_esm_bundle.
  //     Did you forget to signal async completion?`
  return new Promise((resolve, reject) => {
    spawn('polymer', ['build --name "pmp_poly3/esm-bundled" ' +
    '--preset "es6-bundled" --bundle --js-minify --css-minify --html-minify ' +
    '--add-service-worker --module-resolution "node" --npm ' +
    '--entrypoint "index.html" --shell "src/components/app-shell/app-shell.js" ' +
    '--fragment "src/components/app-modules/partners/partners-module.js" ' +
    '"src/components/app-modules/partners/pages/list/partners-list.js"'
    ], spawnOptions);
    resolve();
  });
});
