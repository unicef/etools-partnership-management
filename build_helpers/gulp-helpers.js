/* eslint-disable */
var gulp = require('gulp');

function matchesExt(extension) {
  return (fs) => !!fs.path && fs.relative.endsWith(extension);
}

/**
 * Waits for the given ReadableStream
 */
function waitFor(stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

function pipeStreams(streams) {
  return Array.prototype.concat.apply([], streams)
    .reduce((a, b) => {
      return a.pipe(b);
    });
}

function copyFiles(src, dest) { //src is array
  return gulp.src(src)
    .pipe(gulp.dest(dest));
}


module.exports = {
  matchesExt: matchesExt,
  waitFor: waitFor,
  pipeStreams: pipeStreams,
  copyFiles: copyFiles
};
