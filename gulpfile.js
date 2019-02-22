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
  cmd.replace('[sources]', buildCmdFlagArrStrValue([...sources, ...fragments]));
  return cmd.replace('[fragments]', buildCmdFlagArrStrValue(fragments));
}

const buildCmdTmpl = `build --name "[name]" --entrypoint "${polymerConfig.entrypoint}" \
    --shell "${polymerConfig.shell}" [sources] \
    --extra-dependencies ${buildCmdFlagArrStrValue(polymerConfig.extraDependencies)} \
    ${getModuleResolution()} ${getNpmMode()} \
    [build_options] --fragment [fragments]`;

function runBuildCmd(cmd, fragmentsSetIndex, buildName) {
  return new Promise((resolve, reject) => {
    console.log('running: polymer ' + cmd);
    const buildProcess = spawn('polymer', [cmd], spawnOptions);
    buildProcess.on('close', (code) => {
      if (code !== 0) {
        console.log(`process build_esm_bundle[${fragmentsSetIndex}] exited with code ${code}`);
        reject();
      }
      console.log(`process build_esm_bundle[${fragmentsSetIndex}] completed...`);
      // save build files in a temp folder
      const fragmentsBuildFolderPath = `build_temp/${buildName}_tmp_${fragmentsSetIndex}`;
      const saveBuild = spawn('mkdir', [`-p build_temp && mv build ${fragmentsBuildFolderPath}`], spawnOptions);
      saveBuild.on('close', (code) => {
        if (code !== 0) {
          console.log(`mkdir -p build_temp && mv build ${fragmentsBuildFolderPath} exited with code ${code}`);
          reject();
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
      // return mergeTempBuildFolders(buildName);
      console.log('====================== DONE ====================== ');
    }
  });
}

// function copyFile(sourceFolder, destFolder, path) {
//   return new Promise((resolve, reject) => {
//     const fileFolderPath = path.substr(0, path.lastIndexOf('/') + 1);
//     const destFolderPath = destFolder + fileFolderPath;
//     const fileFromPath = sourceFolder + path;
//     const fileToPath = destFolder + path;
//     const copyCmd = `-p ${destFolderPath} && cp ${fileFromPath} ${fileToPath}`;
//     console.log('copy cmd: mkdir ', copyCmd);
//     const copyF = spawn('mkdir', [copyCmd], spawnOptions);
//     copyF.on('close', (code) => {
//       if (code !== 0) {
//         reject(`copy file from ${fileFromPath} to ${fileToPath} failed`);
//       }
//       resolve();
//     });
//   });
// }

function copyFolder(sourceFolder, destFolder) {
  return new Promise((resolve, reject) => {
    const copyF = spawn('cp', [`-rf ${sourceFolder}/src/* ${destFolder}/src/`], spawnOptions);
    copyF.on('close', (code) => {
      if (code !== 0) {
        console.log(`copy files from ${sourceFolder}/src/ to ${destFolder}/src/ failed`);
        reject();
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
    // ????? merge folders using linux cmd
    // copy first folder, clear src files (remove), copy app-shell and fragments
    // mkdir -p final_build_fragment_path && cp temp_build_fragment_path final_build_fragment_path

    const finalBuildFolder = 'build/' + buildName + '/';
    // clear build/build_name folder files && copy first fragments set bundle
    const initCmd = `-rf ${finalBuildFolder}/* && mv -rf ${buildFolders[0]} ${finalBuildFolder}`;
    console.log('run: rm ' + initCmd);

    const mergeBuildFiles = spawn('rm', [initCmd], spawnOptions);
    mergeBuildFiles.on('close', (code) => {
      if (code !== 0) {
        console.log(`mergeTempBuildFolders failed at first step... exited with code ${code}`);
        reject();
      }
      buildFolders.shift().forEach(async f => await copyFolder(f, finalBuildFolder));

      // copy the remaining bundled fragments from the other build_temp folders
      // buildFolders.shift().forEach((tmpBuildFolder, index) => {
      //   const files = polymerConfig.fragment_sets[index + 1]; // exclude first set (already copied, prev step)
      //   if (files instanceof Array && files.length > 0) {
      //     files.forEach(async (f) => {
      //       await copyFile(tmpBuildFolder, finalBuildFolder, f);
      //     });
      //   }
      // })

    });
  });
}

/**
 * Gulp build task for esm-bundle
 */
gulp.task('build_esm_bundle', (done) => {
  const name = 'pmp_poly3/esm-bundled';
  let cmd = getBuildCmd(name);

  // build each fragment set
  buildFragments(cmd, 0, name).catch(() => {
    console.log('build failed!');
  });

  done(); // to fix `Did you forget to signal async completion?` error

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

