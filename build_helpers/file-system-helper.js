'use strict';
const spawn = require('child_process').spawn;
const spawnOptions = {
  // `shell` option for Windows compatability. See:
  // https://nodejs.org/api/child_process.html#child_process_spawning_bat_and_cmd_files_on_windows
  shell: true,
  stdio: 'inherit'
};

function moveBuildToTempFolder(buildName) {
  return new Promise((resolve, reject) => {

      // save build files in a temp folder
    const buildFolderPath = `build_temp/${buildName}`;
    let builtFragmTemp = spawn('mkdir', [buildFolderPath], spawnOptions);
    builtFragmTemp.on('close', (code) => {
      /**
       * for some reason when build folder is moved,
      * on next iteration polymer root build folder is changed to currently moved folder
      * `cd ../../` will make sure polymer build folder is the same on next iteration
      * @type {ChildProcess}
      */
      const saveBuild = spawn('mv',
      [`build/${buildName} ${buildFolderPath} && cd ../../`], spawnOptions);

      saveBuild.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`mv build ${buildFolderPath} exited with code ${code}`));
      }
      console.log(`Build ${buildName} moved to build_temp folder!`);

      resolve();
      });
    });

  });

}

function moveFolder(source, destination) {

  return new Promise((resolve, reject) => {
    console.log('Moving folder: ', source);
    // clear build/build_name folder files && copy bundle
    const initCmd = `${source} ${destination}`;

    const moveFolder = spawn('mv', [initCmd], spawnOptions);

    console.log('run: mv ' + initCmd);

    moveFolder.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`moveTempBuildFolders failed at first step... exited with code ${code}`));
      }
     resolve();

    });
  });
}

function moveTempToBuildFolder() {
  return moveFolder(`build_temp/esm-bundled`, `build/esm-bundled`).then(() => {
    return moveFolder(`build_temp/es6-bundled`, `build/es6-bundled`).then(() => {
      return moveFolder(`build_temp/es5-bundled`, `build/es5-bundled`);
    });
  });
}

function deleteFolder(path, resolve, reject) {
  const rmTempBuildFolder = spawn('rm', [' -rf ' + path], spawnOptions);

      rmTempBuildFolder.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`removing ${path} folder failed... exited with code ${code}`));
        }
        resolve();
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


function createBuildTempFolder() {
  return spawn('mkdir', ['build_temp'], spawnOptions);
}

module.exports = {
  moveBuildToTempFolder: moveBuildToTempFolder,
  moveTempToBuildFolder: moveTempToBuildFolder,
  createBuildTempFolder: createBuildTempFolder
}
