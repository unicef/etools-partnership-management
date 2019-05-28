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



//const del = require('del');
//const gulp = require('gulp');
const gulpif = require('gulp-if');
const mergeStream = require('merge-stream');
const polymerBuild = require('polymer-build');
const through2 = require('through2').obj;

// Here we add tools that will be used to process our source files.
//const imagemin = require('gulp-imagemin');

// Additional plugins can be used to optimize your source files after splitting.
// Before using each plugin, install with `npm i --save-dev <package-name>`
// const uglify = require('gulp-uglify');
// const cssSlam = require('css-slam').gulp;
// const htmlMinifier = require('gulp-html-minifier');

const swPrecacheConfig = require('./sw-precache-config.js');
const polymerJson = require('./polymer.json');
const polymerProject = new polymerBuild.PolymerProject(polymerJson);
const buildDirectory = 'build';

function matchesExt(extension) {
  return (fs) => !!fs.path && fs.relative.endsWith(extension);
}

/**
 * Waits for the given ReadableStream
 */
function waitFor(stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

function pipeStreams(streams) {
  return Array.prototype.concat.apply([], streams)
      .reduce((a, b) => {
        return a.pipe(b);
      });
}

async function build(done) {
 // return new Promise((resolve, reject) => { // eslint-disable-line no-unused-vars

    // Lets create some inline code splitters in case you need them later in your build.
    //let sourcesStreamSplitter = new polymerBuild.HtmlSplitter();
    //let dependenciesStreamSplitter = new polymerBuild.HtmlSplitter();

    // Okay, so first thing we do is clear the build directory
    //console.log(`Deleting ${buildDirectory} directory...`);
    // del([buildDirectory])
    //   .then(() => {

        // Let's start by getting your source files. These are all the files
        // in your `src/` directory, or those that match your polymer.json
        // "sources"  property if you provided one.
        //let sourcesStream = polymerProject.sources();

          // If you want to optimize, minify, compile, or otherwise process
          // any of your source code for production, you can do so here before
          // merging your sources and dependencies together.
         // .pipe(gulpif(/\.(png|gif|jpg|svg)$/, imagemin()))

          // The `sourcesStreamSplitter` created above can be added here to
          // pull any inline styles and scripts out of their HTML files and
          // into seperate CSS and JS files in the build stream. Just be sure
          // to rejoin those files with the `.rejoin()` method when you're done.
         // .pipe(sourcesStreamSplitter.split())

          // Uncomment these lines to add a few more example optimizations to your
          // source files, but these are not included by default. For installation, see
          // the require statements at the beginning.
          // .pipe(gulpif(/\.js$/, uglify())) // Install gulp-uglify to use
          // .pipe(gulpif(/\.css$/, cssSlam())) // Install css-slam to use
          // .pipe(gulpif(/\.html$/, htmlMinifier())) // Install gulp-html-minifier to use

          // Remember, you need to rejoin any split inline code when you're done.
          //.pipe(sourcesStreamSplitter.rejoin());


        // Similarly, you can get your dependencies seperately and perform
        // any dependency-only optimizations here as well.
        //let dependenciesStream = polymerProject.dependencies();
         // .pipe(dependenciesStreamSplitter.split())
          // Add any dependency optimizations here.
         // .pipe(dependenciesStreamSplitter.rejoin());

        const htmlSplitter = new polymerBuild.HtmlSplitter();
        // Okay, now let's merge your sources & dependencies together into a single build stream.
        let buildStream = mergeStream(polymerProject.sources(), polymerProject.dependencies())
          .once('data', () => {
            console.log('Analyzing build dependencies...');
          });

        // If you want bundling, pass the stream to polymerProject.bundler.
        // This will bundle dependencies into your fragments so you can lazy
        // load them.
        // ------ Bundle --------------
        buildStream = buildStream.pipe(polymerProject.bundler())

        // ------ Minify Js ------------
       // buildStream = buildStream.pipe(polymerBuild.getOptimizeStreams({js:{minify:true, moduleResolution: 'node'}}));
        buildStream = pipeStreams([
          buildStream,
          htmlSplitter.split(),

          polymerBuild.getOptimizeStreams({js:{minify:true, moduleResolution: 'node'}}),
          htmlSplitter.rejoin()
          ]);

        buildStream = buildStream.pipe(gulp.dest(buildDirectory+'/esm-bundled'));


        //----- Transform Modules to AMD ----------
        // buildStream = buildStream.pipe(polymerBuild.getOptimizeStreams({js: {
        //       transformModulesToAmd: true,
        //       moduleResolution: 'node'
        //     },
        //     entrypointPath: polymerProject.config.entrypoint
        //   }));
        buildStream = pipeStreams([
          buildStream,
          htmlSplitter.split(),

          polymerBuild.getOptimizeStreams({js: {
                   transformModulesToAmd: true,
                   moduleResolution: 'node'
                 },
                 entrypointPath: polymerProject.config.entrypoint
               }),
          htmlSplitter.rejoin()]);

        buildStream = buildStream.pipe(gulp.dest(buildDirectory+'/es6-bundled'))

        // ---- Transpile to ES5 --------------
        // 
        //                          .pipe(gulpif(matchesExt('.js'), through2(polymerProject.jsTransform(file, {
        //                                       js: {
        //                                         compile: true,
        //                                         moduleResolution: 'node'
        //                                       },
        //                                       entrypointPath: polymerProject.config.entrypoint
        //                                     }))));
        buildStream = buildStream.pipe(polymerProject.addCustomElementsEs5Adapter())
        buildStream = pipeStreams([
          buildStream,
          htmlSplitter.split(),

          polymerBuild.getOptimizeStreams({js: {
                                             compile: true,
                                             moduleResolution: 'node'
                                           },
                                           entrypointPath: polymerProject.config.entrypoint
                                         }),
          htmlSplitter.rejoin()
        ]);

        buildStream.pipe(gulp.dest(buildDirectory+'/es5-bundled'));

        // waitFor the buildStream to complete
        await waitFor(buildStream);
      //})
     // .then(() => {
        // Okay, now let's generate the Service Worker
        console.log('Generating the Service Worker...');
        await polymerBuild.addServiceWorker({
          project: polymerProject,
          buildRoot: buildDirectory,
          bundled: true,
          swPrecacheConfig: swPrecacheConfig
        });
      //})
      //.then(() => {
        // You did it!
        console.log('Build complete!');
        done();
     // });
 // });
}



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

gulp.task('build-with-lib', (done) => build(done));

gulp.task('build1by1', gulp.series(polymerBuilds.buildEsmBundled, polymerBuilds.buildEs6Bundled,
polymerBuilds.buildEs5Bundled));
