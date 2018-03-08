// Any processing of javascript should
// go in functions here

'use strict';

//const uglify = require('gulp-uglify');
const uglifyHarmony = require('uglify-js-harmony');
const minifier = require('gulp-uglify/minifier');
const jshint = require('gulp-jshint');
const jshintStylish = require('jshint-stylish');
const jscs = require('gulp-jscs');
const jscsStylish = require('gulp-jscs-stylish');
const lazypipe = require('lazypipe'); // Lazy pipe creates a reusable pipe stream
const $ = require('gulp-load-plugins')();

// Minify Javascript
function minify() {
  let uglifyOptions = {
    preserveComments: false
  };
  //return uglify(uglifyOptions);
  return minifier(uglifyOptions, uglifyHarmony);
}

// Lint Javascript
const lint = lazypipe()
    .pipe(jshint)
    .pipe(jscs)
    .pipe(jscsStylish.combineWithHintResults)
    .pipe(jshint.reporter, jshintStylish)
    // Option to have js linting fail on error
    .pipe(jshint.reporter, 'fail');

//babel transpile JS
const babelify = lazypipe()
    .pipe(() => ($.if('*.html', $.crisper({scriptInHead: false}))))
    .pipe(() => ($.if('*.js', $.babel())));

module.exports = {
  minify: minify,
  lint: lint,
  babelify: babelify
};
