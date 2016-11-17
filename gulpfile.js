'use strict';

const gulp = require('gulp');
const path = require('path');
const jade = require('gulp-jade');
const sass = require('gulp-sass');
//const stylus = require('gulp-stylus');
// minfi
const cssnano = require('gulp-cssnano');
// cach
const rev = require('gulp-rev');
const resolver = require('stylus').resolver;

// for manifest file
const revReplace = require('gulp-rev-replace');

// const resolver = require('sass-import-resolve');
const sourcemaps = require('gulp-sourcemaps');

// const concatCss = require('gulp-concat-css');

const autoprefixer = require('gulp-autoprefixer');
const remember = require('gulp-remember');
const gulpIf =  require('gulp-if');

// create SPRITE----------------------------------------------------------------
// const svgSprite = require("gulp-svg-sprites");
const svgSprite = require("gulp-svg-sprite");
const spritesmith = require('gulp.spritesmith');
// compress IMAGE---------------------------------------------------------------
const imageop = require('gulp-image-optimization');
const imageminMozjpeg = require('imagemin-mozjpeg');

const newer = require('gulp-newer');
// const cached = require('gulp-cached')

// concat = require('gulp-concat'),
const debug = require('gulp-debug');
const del =  require('del');
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify');

// const multipipe = require('multipipe');
const mainBowerFiles = require('gulp-main-bower-files');


// javascript
// const pump = require('pump');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const isDevelopment =!process.env.NODE_ENV || process.env.NODE_ENV == 'development';
// NODE_ENV=prodaction gulp build

/*
********************************************************************************
  Styles sass
********************************************************************************
*/
gulp.task('styles', function () {

 return gulp.src('app/styles/main.{sass,scss}') //{base:'app'}, {since: gulp.lastRun('styles')})
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(sass({
      define:{ url:resolver()},

    }).on('error', notify.onError()))
    .pipe(autoprefixer('last 2 version', '> 1%', 'IE 9'))
    .pipe(remember('styles'))
    .pipe(debug({title: 'styles'}))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))

    .pipe(gulpIf(!isDevelopment, cssnano()))
    .pipe(gulpIf(!isDevelopment, rev()))
    .pipe(gulp.dest('dist/styles'))
    .pipe(gulpIf(!isDevelopment, rev.manifest('css.json')))
    .pipe(gulpIf(!isDevelopment, gulp.dest('manifest')));

    // concatCss('all.css'),
});

/*
********************************************************************************
  Styles stylus
********************************************************************************
*/
// gulp.task('styles', function () {

//  return gulp.src('app/styles/*.styl') //{base:'app'}, {since: gulp.lastRun('styles')}),
//     .pipe(gulpIf(isDevelopment, sourcemaps.init()))
//     .pipe(stylus({
//       import: process.cwd() + '/tmp/styles/_sprite',
//       define:{url:resolver()}
//     }))
//     .pipe(autoprefixer('last 2 version', '> 1%', 'IE 9'))
//     // remember('styles'),
//     .pipe(debug({title: 'styles'}))
//     // .pipe(concatCss('all.css'))
//     .pipe(gulpIf(isDevelopment, sourcemaps.write()))
//     .pipe(gulpIf(!isDevelopment, cssnano()))
//     .pipe(gulpIf(!isDevelopment, rev()))
//     .pipe(gulp.dest('dist/styles'))
//     .pipe(gulpIf(!isDevelopment, rev.manifest('css.json')))
//     .pipe(gulpIf(!isDevelopment, gulp.dest('manifest')));
//     // .on('error', notify.onError());


// });

// gulp.task('styles:assets', function () {
//   return gulp.src('app/assets/img/*.{png,jpg,svg}')//, {since: gulp.lastRun('assets')})
//     .pipe(newer('dist'))
//     .pipe(debug({title: 'assets'}))
//     .pipe(gulp.dest('dist/img/'));

// })

// gulp.task('assets', function () {
//   return gulp.src('app/assets/**', {since: gulp.lastRun('assets')})
//     .pipe(gulpIf(!isDevelopment, revReplace({
//       manifest: gulp.src('manifest/css.json', {allowEmpty: true})
//     })))

//     // .pipe(newer('dist'))
//     .pipe(debug({title: 'assets'}))
//     .pipe(gulp.dest('dist'));

// })

/*
********************************************************************************
  Concat all js file
********************************************************************************
*/
gulp.task('javascript', function () {

  const options = {
    mangle: false,
    compress: false,
    preserveComments: false,
    // preserveComments: 'license',
    output: { beautify: true}
  }

  return gulp.src('app/js/*.js')
    .pipe(uglify(options)).on('error', notify.onError())
    .pipe(gulpIf(!isDevelopment, rev()))
    .pipe(gulp.dest('dist/js'))
    .pipe(gulpIf(!isDevelopment, rev.manifest('js.json')))
    .pipe(gulpIf(!isDevelopment, gulp.dest('manifest')));
});

/*
********************************************************************************
  jade
********************************************************************************
*/
gulp.task('assets:jade', function() {
  return gulp.src(['app/layouts/index.jade', 'app/assets/**/*.jade']) //, {since: gulp.lastRun('assets:jade')})
  .pipe(jade({
    pretty: true
  }).on('error', notify.onError()))
    .pipe(gulpIf(!isDevelopment, revReplace({
      manifest: gulp.src('manifest/*.json', {allowEmpty: true})
    })))
  .pipe(gulp.dest('dist'));
});
/*
********************************************************************************
  clean
********************************************************************************
*/
gulp.task('clean', function () {
  //return del('dist');
  return del(['dist/styles', 'dist/*.html', 'dist/js', 'dist/img', '!dist/lib']);
})


/*
********************************************************************************
  compress images file
********************************************************************************
*/
gulp.task('img', function(cb) {
  return gulp.src('app/assets/img/*.{jpg,png}', {since: gulp.lastRun('img')})

  .pipe(imageop({
    plugins: [imageminMozjpeg()],
    optimizationLevel: 5,
    progressive: true,
    interlaced: true
  }))
  .pipe(remember('img'))
  .pipe(debug({title: 'img'}))
  .pipe(gulp.dest('dist/img')).on('end', cb).on('error', cb);
});
/*
********************************************************************************
  create svg file
********************************************************************************
*/
gulp.task('svg', function() {

// SVG Config-------------------------------------------------------------------
var config = {
  mode: {
    css: {
      dest: '.', // where
      bust: !isDevelopment,
      sprite: 'sprite.svg',
      layout: 'vertical',
      prefix: '.i-',
      dimensions: true,
      render: {
        scss: {
          dest: '_sprite.scss'
        }
      }
    }
  }
};
  return gulp.src(['app/assets/img/icons/*.svg'])
    .pipe(svgSprite(config)).on('error', function(error){ console.log(error); })
    .pipe(debug({title: 'svg'}))
    // .pipe(gulpIf('*{.scss,styl}', gulp.dest('tmp/styles'), gulp.dest('dist/styles')));
    .pipe(gulpIf('*.scss', gulp.dest('app/styles'), gulp.dest('dist/styles')));
});

/*
********************************************************************************
  create png sprite
********************************************************************************
*/
gulp.task('png', function() {
    // var spriteData =
      return  gulp.src('app/assets/img/icons/*.png') // путь, откуда берем картинки для спрайта
            .pipe(spritesmith({
                imgName: 'sprite.png',
                cssFormat: 'sass',
                imgPath: '../styles/sprite.png',
                cssName: '_spritePng.sass',
                algorithm: 'binary-tree',
                cssVarMap: function(sprite) {
                    sprite.name = '' + sprite.name
                }
              }

            ))
            .pipe(debug({title: 'png'}))
            .pipe(gulpIf('*.sass', gulp.dest('app/styles'), gulp.dest('dist/styles')));

    // spriteData.pipe(debug({title: 'png'}));
    // spriteData.img.pipe(gulp.dest('dist/styles')); // путь, куда сохраняем картинку
    // spriteData.css.pipe(gulp.dest('app/styles')); // путь, куда сохраняем стили
});
/*
********************************************************************************
  copy bower file
********************************************************************************
*/
gulp.task('bower', function() {
  return gulp.src('./bower.json').pipe(mainBowerFiles({
    overrides: {
      almond: {
        "ignore": true
      },
      jquery: {
        main: ["./dist/jquery.min.js"]
      },
      "materialize": {
        main: ["./js/modal.js","./js/waves.js", "./**/velocity.min.js"]
      },
      "owl.carousel":{
        main: ["./dist/*.min.js", "./dist/assets/*.min.css", "./dist/assets/*.gif"]
      }
    }
  })).pipe(gulp.dest('dist/lib'));
});
/*

/*
********************************************************************************
 watch
********************************************************************************
*/
gulp.task('watch', function () {

  gulp.watch(['app/styles/**/*.*', 'tmp/styles/_sprite.styl'], gulp.series('styles')).on('unlink', function(filepath){
    remember.forget('styles', path.resolve(filepath));
  });
  // gulp.watch('app/assets/**/*.*', gulp.series('assets'));
  gulp.watch(['app/assets/**/*.jade' ,'app/layouts/index.jade'], gulp.series('assets:jade'));

  gulp.watch('app/assets/img/*.{jpg,png}', gulp.series('img'));
  //gulp.watch('app/assets/img/*.{jpg,png,svg}', gulp.series('styles:assets'));

  gulp.watch('app/assets/img/icons/*.{svg}', gulp.series('svg'));
  gulp.watch('app/assets/img/icons/*.{png}', gulp.series('png'));

  gulp.watch('app/js/*.js', gulp.series('javascript'));

});

/*
********************************************************************************
  server
********************************************************************************
*/
gulp.task('serve', function() {
  browserSync.init({
    server: "dist"
  });
  browserSync.watch('dist').on('change', browserSync.reload);
});



/*
********************************************************************************
 build
********************************************************************************
*/
gulp.task('build', gulp.series(
  'clean',
  //'styles:assets',
  'img',
  'svg',
  'png',
  gulp.parallel('styles', /*'assets',*/ 'assets:jade', 'javascript')),
  'watch'
);
/*
********************************************************************************
 run
********************************************************************************
*/
gulp.task('dev', gulp.series('build',
  gulp.parallel('watch','serve'))
);
