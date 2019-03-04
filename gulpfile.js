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

const polymerConfig = require('./polymer.json');

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

const getModuleResolution = () => {
  return polymerConfig.moduleResolution ? `--module-resolution "${polymerConfig.moduleResolution}"` : '';
};

const getNpmMode = () => {
  return polymerConfig.npm ? '--npm' : '';
};

// TODO: improve this in the future
const getBuildConfig = (buildName) => {
  const buildConfig = polymerConfig.builds.find(b => b.name === buildName);
  if (!buildConfig) {
    throw new Error(`polymer.json file has no build configuration for name: ${buildName}`);
  }
  // only preset, minify, compile and transform-modules-to-amd are needed here (app specific)
  const buildFlags = [];
  if (buildConfig.preset) {
    buildFlags.push(`--preset "${buildConfig.preset}"`);
  } else {
    // only if preset is not specified
    if (buildConfig.js && buildConfig.js.compile) {
      buildFlags.push(`--js-compile "${buildConfig.js.compile}"`);
    }
    if (buildConfig.js && buildConfig.js.minify) {
      buildFlags.push('--js-minify');
    }
    if (buildConfig.js && buildConfig.js.transformModulesToAmd) {
      buildFlags.push('--js-transform-modules-to-amd');
    }
    if (buildConfig.css && buildConfig.css.minify) {
      buildFlags.push('--css-minify');
    }
    if (buildConfig.html && buildConfig.html.minify) {
      buildFlags.push('--html-minify');
    }
    if (buildConfig.bundle) {
      buildFlags.push('--bundle');
    }
    if (buildConfig.addServiceWorker) {
      buildFlags.push('--add-service-worker');
    }
  }
  return buildFlags.join(' ');
};

const buildCmdFlagArrStrValue = (strArray) => {
  const s = strArray.map(str => `"${str}"`);
  return s.join(' ');
};

const getBuildCmd = (name) => {
  let cmd = buildCmdTmpl.replace('[name]', name);
  cmd = cmd.replace('[build_options]', getBuildConfig(name));
  return cmd;
};

const setCmdFragments = (cmd, fragments) => {
  return cmd.replace('[fragments]', fragments)
};

const buildCmdTmpl = `build --name "[name]" --entrypoint "${polymerConfig.entrypoint}" \
    --shell "${polymerConfig.shell}" --sources ${buildCmdFlagArrStrValue(polymerConfig.sources)} \
    --extra-dependencies ${buildCmdFlagArrStrValue(polymerConfig.extraDependencies)} \
    ${getModuleResolution()} ${getNpmMode()} \
    [build_options] --fragment [fragments]`;

function runBuildCmd(cmd, fragmentsSetIndex) {
  return new Promise((resolve, reject) => {
    console.log('running: polymer ' + cmd);
    const buildProcess = spawn('polymer', [cmd], spawnOptions);
    buildProcess.on('close', (code) => {
      if (code !== 0) {
        console.log(`process build_esm_bundle[${fragmentsSetIndex}] exited with code ${code}`);
        reject();
      }
      console.log(`process build_esm_bundle[${fragmentsSetIndex}] completed...`);
      resolve();
    });
  });
}

function buildFragments(cmd, i) {
  let buildCmd = setCmdFragments(cmd, buildCmdFlagArrStrValue(polymerConfig.fragment_sets[i]));
  return runBuildCmd(buildCmd, i).then(() => {
    if (++i < polymerConfig.fragment_sets.length) {
      buildCmd = setCmdFragments(cmd, buildCmdFlagArrStrValue(polymerConfig.fragment_sets[i]));
      return runBuildCmd(buildCmd, i);
    }
  });
}

/**
 * Gulp build task for esm-bundle
 */
gulp.task('build_esm_bundle', (done) => {
  const name = 'pmp/esm-bundled';
  let cmd = getBuildCmd(name);

  // const fragmentsBuildPromises = [];

  // build each fragment set

  // polymerConfig.fragment_sets.forEach(async (f) => {
    // const fragments = buildCmdFlagArrStrValue(f);
    // const buildCmdForFragmentsSet = setCmdFragments(cmd, buildCmdFlagArrStrValue(polymerConfig.fragment_sets[i]));
  buildFragments(cmd, 0).catch(() => {
          console.log('build failed!');
        });
  // });

  done(); // to fix `Did you forget to signal async completion?` error

  // const esmBundle = spawn('polymer', [cmd], spawnOptions);
  //
  // esmBundle.on('close', (code) => {
  //   if (code !== 0) {
  //     console.log(`process build_esm_bundle exited with code ${code}`);
  //   }
  //   console.log(`process build_esm_bundle completed...`);
  // });
  // return esmBundle;
});

