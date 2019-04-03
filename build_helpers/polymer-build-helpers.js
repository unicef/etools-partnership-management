
'use strict';

const polymerJson = require('../polymer.json');
const spawn = require('child_process').spawn;

const spawnOptions = {
  // `shell` option for Windows compatability. See:
  // https://nodejs.org/api/child_process.html#child_process_spawning_bat_and_cmd_files_on_windows
  shell: true,
  stdio: 'inherit'
};

const polymerBuildCmdTemplate = `build --name "[name]" --entrypoint "${polymerJson.entrypoint}" \
    --shell "${polymerJson.shell}" --sources ${buildCmdFlagArrStrValue(polymerJson.sources)} \
    --extra-dependencies ${buildCmdFlagArrStrValue(polymerJson.extraDependencies)} \
    ${getModuleResolution()} ${getNpmMode()} \
    [build_options] --fragment ${buildCmdFlagArrStrValue(polymerJson.fragments)}`; // --verbose

function buildCmdFlagArrStrValue(strArray) {
  const s = strArray.map(str => `"${str}"`);
  return s.join(' ');
}

function getModuleResolution() {
  return polymerJson.moduleResolution ? `--module-resolution "${polymerJson.moduleResolution}"` : '';
}

function getNpmMode() {
  return polymerJson.npm ? '--npm' : '';
}

// TODO: improve this in the future
function getTransformOptions(buildName) {
  const buildConfig = polymerJson.builds.find(b => b.name === buildName);
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

function setName(cmd, name) {
  return cmd.replace('[name]', name);
}

function setTransformOptions(cmd, name) {
  return cmd.replace('[build_options]', getTransformOptions(name));
}

function getBuildCommand(buildName) {
  let cmd = setName(polymerBuildCmdTemplate, buildName);
  cmd = setTransformOptions(cmd, buildName);
  return cmd;
}

function runBuildCmd(buildName) {
  return new Promise((resolve, reject) => {
    let cmd = getBuildCommand(buildName);

    console.log('Running: polymer ' + cmd);

    const buildProcess = spawn('polymer', [cmd], spawnOptions);

    buildProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Process build ${buildName} exited with code ${code}`));
      }

      console.log(`Process build ${buildName} completed!`);
      resolve();
    });
  });
}

module.exports = {
  polymerBuildCmdTemplate: polymerBuildCmdTemplate,
  setName: setName,
  setTransformOptions: setTransformOptions,
  runBuildCmd: runBuildCmd
}

