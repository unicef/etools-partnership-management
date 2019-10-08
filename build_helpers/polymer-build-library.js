/* eslint-disable */
/**
 * Resource :
 *    https://github.com/PolymerElements/generator-polymer-init-custom-build/blob/master/generators/app/gulpfile.js
 *    polymer 3 presets list: https://polymer-library.polymer-project.org/3.0/docs/tools/polymer-cli-commands#presets
 *    known issues: https://www.polymer-project.org/blog/2018-04-12-polymer-3-tools-update
 */

const swPrecacheConfig = require('../sw-precache-config.js');
const polymerJson = require('./../polymer.json');
var gulp = require('gulp');

const mergeStream = require('merge-stream');
const forkStream = require('polymer-build').forkStream;
const polymerBuild = require('polymer-build');
const del = require('del');
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

  let splitter = new polymerBuild.HtmlSplitter();
  // Okay, now let's merge your sources & dependencies together into a single build stream.
  let buildStream = mergeStream(polymerProject.sources(), polymerProject.dependencies())
      .once('data', () => {
        console.log('Analyzing build dependencies...');
      });

  // Bundle
  buildStream = buildStream.pipe(polymerProject.bundler({
    stripComments: true,
    inlineScripts: false
  }));

  // ESM build
  let esmBuildStream = helpers.pipeStreams([
    forkStream(buildStream),
    ...polymerBuild.getOptimizeStreams({
      js: {
        moduleResolution: 'node',
        minify: true,
      },
      entrypointPath: polymerProject.config.entrypoint
    })
  ]);

  const buildsPromises = [];

  // Save esm-bundled
  esmBuildStream = esmBuildStream.pipe(gulp.dest(buildDirectory + '/esm-bundled'))
      .on('end', () => console.log('ESM Build Complete...'));
  buildsPromises.push(helpers.waitFor(esmBuildStream));

  // ES6 build - transform modules to AMD, minify, compile
  let es6BuildStream = helpers.pipeStreams([
    forkStream(buildStream),
    splitter.split(),
    ...polymerBuild.getOptimizeStreams({
      js: {
        moduleResolution: 'node',
        minify: true,
        compile: {
          target: 'es2015'
        },
        transformModulesToAmd: true
      },
      css: {
        minify: true
      },
      html: {
        minify: true
      },
      entrypointPath: polymerProject.config.entrypoint
    }),
    splitter.rejoin(),
  ]);

  // Save es6-bundled
  es6BuildStream = es6BuildStream.pipe(gulp.dest(buildDirectory + '/es6-bundled'))
      .on('end', () => console.log('ES6 Build Complete...'));
  buildsPromises.push(helpers.waitFor(es6BuildStream));

  // ES5 build transform modules to AMD, minify, compile to ES5
  let es5BuildStream = helpers.pipeStreams([
    forkStream(buildStream),
    ...polymerBuild.getOptimizeStreams({
      js: {
        moduleResolution: 'node',
        minify: true,
        compile: {
          target: 'es5'
        },
        transformModulesToAmd: true
      },
      css: {
        minify: true
      },
      html: {
        minify: true
      },
      entrypointPath: polymerProject.config.entrypoint
    })
  ]);

  es5BuildStream = es5BuildStream.pipe(polymerProject.addCustomElementsEs5Adapter());

  // Save es5-bundled
  es5BuildStream = es5BuildStream.pipe(gulp.dest(buildDirectory + '/es5-bundled'))
      .on('end', () => console.log('ES5 Build Complete...'));
  buildsPromises.push(helpers.waitFor(es5BuildStream));

  await Promise.all(buildsPromises).then(() => {
    console.log('Build complete...')
  })
      .catch((err) => console.log(err))
      .then(() => done());
}

async function generateServiceWorker(done) {
  console.log('Generating the Service Worker...');
  await polymerBuild.addServiceWorker({
    project: polymerProject,
    buildRoot: buildDirectory,
    bundled: true,
    swPrecacheConfig: swPrecacheConfig
  });
  console.log('Service worker generated...');
  done();
}

async function moveServiceWorker(done) {
  await helpers.copyFiles([buildDirectory + '/service-worker.js'], buildDirectory + '/esm-bundled');
  await helpers.copyFiles([buildDirectory + '/service-worker.js'], buildDirectory + '/es6-bundled');
  await helpers.copyFiles([buildDirectory + '/service-worker.js'], buildDirectory + '/es5-bundled');

  await del(buildDirectory + '/service-worker.js');
  console.log('Service worker copied to appropriate folders...');
  done();
}

module.exports = {
  deleteBuildDirectory: deleteBuildDirectory,
  build: build,
  generateServiceWorker: generateServiceWorker,
  moveServiceWorker: moveServiceWorker
};
