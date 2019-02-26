'use strict';
const buildHelper = require('./polymer-build-helpers');

function buildEsmBundled(done) {
  const name = 'esm-bundled';
  let cmd = buildHelper.setName(buildHelper.polymerBuildCmdTemplate, name);
  cmd = buildHelper.setTransformOptions(cmd, name);


  // build each fragment set
  buildHelper.buildFragments(cmd, 0, name).then(() => {
    console.log('====================== DONE ====================== ');
    done();
  }).catch((err) => {
    console.log('build failed!', err);
    done();
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

function buildEs6Bundled() {

}

function buildEs5Bundled() {

}

module.exports = {
  buildEsmBundled: buildEsmBundled,
  buildEs6Bundled: buildEs6Bundled,
  buildEs5Bundled: buildEs5Bundled
}
