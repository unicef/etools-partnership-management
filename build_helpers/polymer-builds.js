'use strict';
const buildHelper = require('./polymer-build-helpers');
const fsHelper = require('./file-system-helper');

function buildEsmBundled(done) {
  const name = 'esm-bundled';

  const tempFolder = fsHelper.createBuildTempFolder();

  buildHelper.runBuildCmd(name).then(() => {
    fsHelper.moveBuildToTempFolder(name).then(() => {
      console.log('====================== DONE ====================== ');
      done();
    }).catch((err) => {
      console.log('Move to temp failed!', err);
      done();
    });
  }).catch((err) => {
    console.log(err);
  });

  // done(); // to fix `Did you forget to signal async completion?` error

  /**
   * Generated build cmd example:
   * polymer build --name "pmp_poly3/esm-bundled" \
   * --preset "es6-bundled" \
   * --bundle --js-minify --css-minify --html-minify --add-service-worker \
   * --module-resolution "node" --npm \
   * --entrypoint "index.html" --shell "src/components/app-shell/app-shell.js" \
   * --fragment "src/components/app-modules/partners/partners-module.js" "src/components/app-modules/partners/pages/list/partners-list.js"
   */
}

function buildEs6Bundled(done) {
  const name = 'es6-bundled';

  const tempFolder = fsHelper.createBuildTempFolder();

  buildHelper.runBuildCmd(name).then(() => {
    fsHelper.moveBuildToTempFolder(name).then(() => {
      console.log('====================== DONE ====================== ');
      done();
    }).catch((err) => {
      console.log('Move to temp failed!', err);
      done();
    });
  }).catch((err) => {
    console.log(err);
  });
}

function buildEs5Bundled(done) {
  const name = 'es5-bundled';

  const tempFolder = fsHelper.createBuildTempFolder();

  buildHelper.runBuildCmd(name).then(() => {
    fsHelper.moveBuildToTempFolder(name).then(() => {
      console.log('====================== DONE ====================== ');
      done();
    }).catch((err) => {
      console.log('Move to temp failed!', err);
      done();
    });
  }).catch((err) => {
    console.log(err);
  });
}

module.exports = {
  buildEsmBundled: buildEsmBundled,
  buildEs6Bundled: buildEs6Bundled,
  buildEs5Bundled: buildEs5Bundled
}
