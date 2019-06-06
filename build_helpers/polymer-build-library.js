/* eslint-disable */
// Resource : https://github.com/PolymerElements/generator-polymer-init-custom-build/blob/master/generators/app/gulpfile.js


const swPrecacheConfig = require('../sw-precache-config.js');
const polymerJson = require('./../polymer.json');
var gulp = require('gulp');

const gulpif = require('gulp-if');
const mergeStream = require('merge-stream');
const polymerBuild = require('polymer-build');
const del = require('del');
const path = require('path');
const helpers = require('./gulp-helpers');
const polymerProject = new polymerBuild.PolymerProject(polymerJson);

const buildDirectory = 'build';

async function deleteBuildDirectory(done) {
  console.log(buildDirectory);
  console.log(`Deleting ${buildDirectory} directory...`);
  await del([buildDirectory]);
  done();
}

async function build(done) {

     // Lets create some inline code splitters in case you need them later in your build.
     //let sourcesStreamSplitter = new polymerBuild.HtmlSplitter();
     //let dependenciesStreamSplitter = new polymerBuild.HtmlSplitter();


    // Okay, now let's merge your sources & dependencies together into a single build stream.
    let buildStream = mergeStream(polymerProject.sources(), polymerProject.dependencies())
      .once('data', () => {
        console.log('Analyzing build dependencies...');
      });


    // ------ Bundle --------------
    buildStream = buildStream.pipe(polymerProject.bundler({
      stripComments: true
    }));

    // ------ Minify --------------
    buildStream = helpers.pipeStreams([
      buildStream,
      ...polymerBuild.getOptimizeStreams({js: {
               moduleResolution: 'node',
               minify: true
             },
             entrypointPath: polymerProject.config.entrypoint
           })
    ]);


    // ------ Save esm-bundled ------
    buildStream = buildStream.pipe(gulp.dest(buildDirectory+'/esm-bundled'));


    //----- Transform Modules to AMD ----------
    buildStream = helpers.pipeStreams([
      buildStream,

      ...polymerBuild.getOptimizeStreams({js: {
              transformModulesToAmd: true,
              moduleResolution: 'node',
              //minify: true
            },
            entrypointPath: polymerProject.config.entrypoint
          })
    ]);

    // ------ Save es6-bundled
    buildStream = buildStream.pipe(gulp.dest(buildDirectory+'/es6-bundled'))

      // ---- Transpile to ES5 --------------
      buildStream = helpers.pipeStreams([
        buildStream,
        ...polymerBuild.getOptimizeStreams({js: {
                                          compile: true,
                                          moduleResolution: 'node'
                                          //minify: true
                                        },
                                        entrypointPath: polymerProject.config.entrypoint
                                      })
      ]);
      buildStream = buildStream.pipe(polymerProject.addCustomElementsEs5Adapter());

      // ----- Save es5-bundled -------------
      buildStream.pipe(gulp.dest(buildDirectory+'/es5-bundled'));
      await helpers.waitFor(buildStream);
      console.log('Build complete!');
      done();

 }

 async function generateServiceWorker(done) {
    console.log('Generating the Service Worker...');
    return polymerBuild.addServiceWorker({
      project: polymerProject,
      buildRoot: buildDirectory,
      bundled: true,
      swPrecacheConfig: swPrecacheConfig
    });
    console.log('Service worker generated');

 }

 async function moveServiceWorker(done) {
  await helpers.copyFiles([buildDirectory + '/service-worker.js'], buildDirectory + '/esm-bundled');
  await helpers.copyFiles([buildDirectory + '/service-worker.js'], buildDirectory + '/es6-bundled');
  await helpers.copyFiles([buildDirectory + '/service-worker.js'], buildDirectory + '/es5-bundled');

  await del(buildDirectory + '/service-worker.js');
  console.log('Service worker copied to apropriate folders');

 }

 const copyServiceWorker = (src, dest) => helpers.copyFiles(src, dest);


 module.exports = {
   deleteBuildDirectory: deleteBuildDirectory,
   build: build,
   generateServiceWorker: generateServiceWorker,
   moveServiceWorker: moveServiceWorker
 }
