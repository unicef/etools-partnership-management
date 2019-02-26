'use strict';
const spawn = require('child_process').spawn;
const spawnOptions = {
  // `shell` option for Windows compatability. See:
  // https://nodejs.org/api/child_process.html#child_process_spawning_bat_and_cmd_files_on_windows
  shell: true,
  stdio: 'inherit'
};

function moveBuildToTempFolder(buildName, fragmentsSetIndex, resolve) {
  // save build files in a temp folder
  const fragmentsBuildFolderPath = `build_temp/${buildName}_tmp_${fragmentsSetIndex}`;
  let builtFragmTemp = spawn('mkdir', [fragmentsBuildFolderPath], spawnOptions);
  builtFragmTemp.on('close', (code) => {
    /**
     * for some reason when build folder is moved,
    * on next iteration polymer root build folder is changed to currently moved folder
    * `cd ../../` will make sure polymer build folder is the same on next iteration
    * @type {ChildProcess}
    */
    const saveBuild = spawn('mv',
    [`build/${buildName} ${fragmentsBuildFolderPath} && cd ../../`], spawnOptions);

     saveBuild.on('close', (code) => {
     if (code !== 0) {
       reject(new Error(`mv build ${fragmentsBuildFolderPath} exited with code ${code}`));
     }

     resolve();
     });
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
  while(i < 2) {
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


function createBuildTempFolder() {
  return spawn('mkdir', ['build_temp'], spawnOptions);
}

module.exports = {
  mergeTempBuildFolders: mergeTempBuildFolders,
  moveBuildToTempFolder: moveBuildToTempFolder,
  createBuildTempFolder: createBuildTempFolder
}
