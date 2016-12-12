// == REQUIRES ==
const gulp = require('gulp');

const buffer     = require('vinyl-buffer');
const postcss    = require('gulp-postcss');
const rm         = require('gulp-rm');
const source     = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const stylus     = require('gulp-stylus');
const webpack    = require('webpack-stream');

// == DIRECTORIES ==
const STYLUS_DIR = './styles/stylus/**/*.styl';
const STYLUS_ROOTDIR = './styles';
const CSS_DIR = './styles/css/**/*.css';
const SCRIPT_DIR = './scripts/**/*.js';
const SCRIPT_ENTRY = './scripts/main.js';

gulp.task('clean-css', () => {
  return gulp.src('./build/**/*.css')
    .pipe(rm());
});

gulp.task('clean-js', () => {
  return gulp.src('./build/**/*.js')
    .pipe(rm());
});

gulp.task('clean', ['clean-css', 'clean-js']);

// == STYLES ==

gulp.task('stylus-build', () => {
  return gulp.src(STYLUS_DIR)
      .pipe(sourcemaps.init())
      .pipe(stylus({
        'include css': true,
      }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(STYLUS_ROOTDIR + '/css/'));
});

gulp.task('css', ['clean-css', 'stylus-build'], () => {
  gulp.src(CSS_DIR)
      .pipe(sourcemaps.init())
      .pipe(postcss([ require('autoprefixer') ]))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./build'));
});

// == SCRIPTS ==

gulp.task('js', function() {
  return gulp.src(SCRIPT_ENTRY)
    .pipe(webpack({
      output: {
        filename: 'app.js',
      },
      resolve: {
        alias: {
          'vue$': 'vue/dist/vue.common.js',
        },
      },
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
gulp.task('default', ['clean', 'css', 'js', 'watch']);
