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

function getModuleResolution() {
  return polymerConfig.moduleResolution ? `--module-resolution "${polymerConfig.moduleResolution}"` : '';
}

function getNpmMode() {
  return polymerConfig.npm ? '--npm' : '';
}

// TODO: improve this in the future
function getBuildConfig (buildName) {
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
}

function buildCmdFlagArrStrValue(strArray) {
  const s = strArray.map(str => `"${str}"`);
  return s.join(' ');
}

function getBuildCmd(name) {
  let cmd = buildCmdTmpl.replace('[name]', name);
  cmd = cmd.replace('[build_options]', getBuildConfig(name));
  return cmd;
}

function setCmdFragments(cmd, fragments) {
  // also set sources from fragments
  let sources = polymerConfig.sources.filter(s => s.indexOf('src/**/*') === -1);
  cmd = cmd.replace('[sources]', buildCmdFlagArrStrValue([...sources, ...fragments]));
  return cmd.replace('[fragments]', buildCmdFlagArrStrValue(fragments));
}

const buildCmdTmpl = `build --name "[name]" --entrypoint "${polymerConfig.entrypoint}" \
    --shell "${polymerConfig.shell}" --sources [sources] \
    --extra-dependencies ${buildCmdFlagArrStrValue(polymerConfig.extraDependencies)} \
    ${getModuleResolution()} ${getNpmMode()} \
    [build_options] --fragment [fragments]`;

function runBuildCmd(cmd, fragmentsSetIndex, buildName) {
  return new Promise((resolve, reject) => {
    console.log('running: polymer ' + cmd);
    const buildProcess = spawn('polymer', [cmd], spawnOptions);
    buildProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`process build_esm_bundle[${fragmentsSetIndex}] exited with code ${code}`));
      }
      console.log(`process build_esm_bundle[${fragmentsSetIndex}] completed...`);
      // save build files in a temp folder
      const fragmentsBuildFolderPath = `build_temp/${buildName}_tmp_${fragmentsSetIndex}`;
      /**
       * for some reason when build folder is moved,
       * on next iteration polymer root build folder is changed to currently moved folder
       * `cd ../../` will make sure polymer build folder is the same on next iteration
       * @type {ChildProcess}
       */
      const saveBuild = spawn('mkdir',
          [`-p build_temp && mv build/${buildName} ${fragmentsBuildFolderPath} && cd ../../`], spawnOptions);
      saveBuild.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`mkdir -p build_temp && mv build ${fragmentsBuildFolderPath} exited with code ${code}`));
        }
        resolve();
      });
    });
  });
}

function buildFragments(cmd, i, buildName) {
  let buildCmd = setCmdFragments(cmd, polymerConfig.fragment_sets[i]);
  return runBuildCmd(buildCmd, i, buildName).then(() => {
    if (++i < polymerConfig.fragment_sets.length) {
      return buildFragments(cmd, i, buildName); // proceed to the next set of fragments
    } else {
      // all fragments sets have been built
      // merge files from temp build folders
      return mergeTempBuildFolders(buildName);
    }
  });
}

function copyFolder(sourceFolder, destFolder) {
  return new Promise((resolve, reject) => {
    const copyF = spawn('cp', [`-rf ${sourceFolder}/src/* ${destFolder}/src/`], spawnOptions);
    copyF.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`copy files from ${sourceFolder}/src/ to ${destFolder}/src/ failed`));
      }
      resolve();
    });
  });
}

function mergeTempBuildFolders(buildName) {
  const buildFolders = [];
  let i = 0;
  while(i < polymerConfig.fragment_sets.length) {
    buildFolders.push(`build_temp/${buildName}_tmp_${i}/`);
    i++;
  }
  console.log('merging temp build folders: ', buildFolders.join(', '));

  return new Promise((resolve, reject) => {
    // copy first folder, clear src files (remove), copy app-shell and fragments
    const finalBuildFolder = 'build/' + buildName + '/';
    // clear build/build_name folder files && copy first fragments set bundle
    const initCmd = `-rf ${finalBuildFolder}* && mv ${buildFolders[0]} ${finalBuildFolder}`;
    console.log('run: rm ' + initCmd);

    const mergeBuildFiles = spawn('rm', [initCmd], spawnOptions);
    mergeBuildFiles.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`mergeTempBuildFolders failed at first step... exited with code ${code}`));
      }

      buildFolders.slice(1).forEach(async f => await copyFolder(f, finalBuildFolder));

      const rmTempBuildFolder = spawn('rm', [' -rf build_temp/'], spawnOptions);
      rmTempBuildFolder.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`removing build_temp folder failed... exited with code ${code}`));
        }
        resolve();
      });

    });
  });
}

/**
 * Gulp build task for esm-bundle
 */
gulp.task('build_esm_bundle', (done) => {
  const name = 'esm-bundled';
  let cmd = getBuildCmd(name);

  // build each fragment set
  buildFragments(cmd, 0, name).then(() => {
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

});

// TODO: might be removed
gulp.task('merge_folders', () => {
  return mergeTempBuildFolders('esm-bundled');
});

/**
 * TODOs:
 *  - apply single responsability
 *  - split fragments set builds from folders merging
 *      - remove code block containing `return mergeTempBuildFolders(buildName);`
 *      - create a new task for removing build_temp folder (see rmTempBuildFolder spawn)
 *      - new gulp task using  gulp.series('build_esm_bundle', 'merge_folders', 'remove_build_temp_folder')
 * - build cmd generation improvements
 * - tasks for es6 and es5
 */
