// == REQUIRES ==
const gulp = require('gulp');

const stylus     = require('gulp-stylus');
const sourcemaps = require('gulp-sourcemaps');
const postcss    = require('gulp-postcss');
const rm         = require('gulp-rm');


// == DIRECTORIES ==
const STYLUS_DIR = './styles/stylus/**/*.styl';
const STYLUS_ROOTDIR = './styles';
const CSS_DIR = './styles/css/**/*.css';

gulp.task('clean-css', () => {
  return gulp.src('./build/**/*.css')
    .pipe(rm());
});

gulp.task('clean', ['clean-css']);

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

gulp.task('stylus-watch', () => {
  return gulp.watch(STYLUS_DIR, ['css']);
});

gulp.task('watch', ['stylus-watch']);

gulp.task('default', ['clean', 'css', 'watch']);
