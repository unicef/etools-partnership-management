const gulp = require('gulp');
const mergeStream = require('merge-stream');
const babel = require('gulp-babel');
const swConfig = require('./sw-precache-config');
const polymerBuild = require('polymer-build');
const fork = polymerBuild.forkStream;
const addServiceWorker = polymerBuild.addServiceWorker;
const PolymerProject = polymerBuild.PolymerProject;

const project = new PolymerProject(require('./polymer.json'));

function waitFor(stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

// Create a build pipeline to pipe both streams together to the 'build/' dir
const customBuild = () => {
  // merge the source and dependencies streams to we can analyze the project
  const allFiles = mergeStream(project.sources(), project.dependencies());
  // .pipe(project.analyzer) error dest.on is not a function

  // fork the stream in case downstream transformers mutate the files
  // this fork will generate the bundle files for the project
  const bundledPhase = fork(allFiles)
    .pipe(
      babel({
        ignore: ['*.json'],
        plugins: ['@babel/plugin-proposal-nullish-coalescing-operator']
      })
    )
    .on('error', console.error.bind(console))
    .pipe(project.bundler())
    // write to the bundled folder
    // TODO(justinfagnani): allow filtering of files before writing
    .pipe(gulp.dest('build/esm-bundled'));

  // Once the bundled build stream is complete, create a service worker for the
  // build
  const bundledPostProcessing = waitFor(bundledPhase).then(() => {
    return addServiceWorker({
      project: project,
      buildRoot: 'build/esm-bundled',
      swConfig: swConfig,
      bundled: true
    });
  });

  return Promise.all([bundledPostProcessing]);
};

gulp.task('default', customBuild);
