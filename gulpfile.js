// == REQUIRES ==
const gulp = require('gulp');

const assets     = require('postcss-assets');
const buffer     = require('vinyl-buffer');
const cssnano    = require('cssnano');
const postcss    = require('gulp-postcss');
const rm         = require('gulp-rm');
const sorting    = require('postcss-sorting');
const source     = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const stylus     = require('gulp-stylus');
const webpack_plugins = require('webpack');
const webpack    = require('webpack-stream');

// == DIRECTORIES ==
const STYLUS_DIR = './styles/**/*.styl';
const STYLUS_ROOTDIR = './styles';
const CSS_DIR = './styles/css/**/*.css';
const SCRIPT_DIR = './scripts/**/*';
const SCRIPT_ENTRY = './scripts/main.js';

gulp.task('clean-css', () => {
  return gulp.src('./build/**/*.css')
    .pipe(rm());
});

gulp.task('clean-js', () => {
  return gulp.src(['./build/**/*.js', './build/**/*.js.map'])
    .pipe(rm());
});

// == STYLES ==

gulp.task('css', ['clean-css'], () => {
  gulp.src(STYLUS_DIR)
      .pipe(sourcemaps.init())
      .pipe(stylus({
        'include css': true,
      }))
      .pipe(postcss([
        require('autoprefixer'),
        assets(),
      ]))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./build'));
});

gulp.task('css-prod', ['clean-css'], () => {
  gulp.src(STYLUS_DIR)
      .pipe(stylus({
        'include css': true,
        'compress': true,
      }))
      .pipe(postcss([
        require('autoprefixer'),
        assets(),
        sorting(),
        cssnano(),
      ]))
      .pipe(gulp.dest('./build'));
});

// == SCRIPTS ==

gulp.task('js', ['clean-js'], function() {
  return gulp.src(SCRIPT_ENTRY)
    .pipe(sourcemaps.init())
    .pipe(webpack({
      devtool: 'source-map',
      output: {
        filename: 'app.js',
      },
      module: {
        loaders: [
          {
            test: /\.vue$/,
            loader: 'vue-loader'
          },
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
          },
        ],
      },
      resolve: {
        alias: {
          'vue$': 'vue/dist/vue.common.js',
        },
      },
      target: 'electron',
    }))
    .on('error', function handleError() {
      this.emit('end'); // Recover from errors
    })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build'));
});

gulp.task('js-prod', ['clean-js'], function() {
  return gulp.src(SCRIPT_ENTRY)
    .pipe(webpack({
      output: {
        filename: 'app.js',
      },
      module: {
        loaders: [
          {
            test: /\.vue$/,
            loader: 'vue-loader'
          },
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/
          },
        ],
      },
      plugins: [
        new webpack_plugins.optimize.DedupePlugin(),
        new webpack_plugins.optimize.OccurrenceOrderPlugin(true),
      ],
      resolve: {
        alias: {
          'vue$': 'vue/dist/vue.common.js',
        },
      },
      target: 'electron',
    }))
    .pipe(gulp.dest('./build'));
});

// == MISC ==

gulp.task('stylus-watch', () => {
  return gulp.watch(STYLUS_DIR, ['css']);
});

gulp.task('js-watch', () => {
  return gulp.watch(SCRIPT_DIR, ['js']);
});

gulp.task('watch', ['stylus-watch', 'js-watch']);
gulp.task('default', ['css', 'js', 'watch']);

gulp.task('package', ['css-prod', 'js-prod']);
