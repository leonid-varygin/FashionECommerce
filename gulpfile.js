const { src, dest } = require('gulp');
const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const sourceMaps = require('gulp-sourcemaps');
const imagemin = require("gulp-imagemin");
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');
// const run = require("run-sequence");
const del = require("del");
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');




function styles() {
    return src('./scss/style.scss')
        .pipe(plumber())
        .pipe(sourceMaps.init())
             .pipe(sass())
             .pipe(autoprefixer({
                 browsers: ['last 2 versions']
             }))
            .pipe(sourceMaps.write())
            .pipe(gulp.dest('./build/css'))
            .pipe(browserSync.reload({stream: true}));
}

function html() {
    return src('*.html')
        .pipe(dest('build'))
        .pipe(browserSync.reload({stream: true}));
}

function js() {
    return src('js/**/*.js')
        .pipe(dest('build/js'))
        .pipe(browserSync.reload({stream: true}));
}
function css() {
    return src('css/**/*.css')
        .pipe(dest('build/css'))
        .pipe(browserSync.reload({stream: true}));
}

function allimg() {
    return src('img/**/*.{png,jpg}')
        .pipe(dest('build/img'))
        .pipe(browserSync.reload({stream: true}));
}
function images() {
    return src('build/img/**/*.{png,jpg}')
        .pipe(imagemin([
            imagemin.jpegtran({progressive: true}),
            imageminJpegRecompress({
                loops: 5,
                min: 65,
                max: 70,
                quality: 'medium'
            }),
            imagemin.optipng({optimizationLevel: 3}),
            // pngquant({quality: '65-70', speed: 5})

        ]))
        .pipe(dest('build/img'))
}
function svg() {
    return gulp.src('img/**/*.svg')
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode: true}
        }))
        .pipe(replace('&gt;', '>'))
        // build svg sprite
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "sprite.svg"
                }
            }
        }))
        .pipe(dest('build/img'));
}

function watch() {


    browserSync.init({
        server: "build",
        tunnel: true,
        notify: false,
    });

    gulp.watch("scss/**/*.scss", styles);
    gulp.watch("*.html", html);
    gulp.watch("css/**/*.css", css);
    gulp.watch("js/**/*.js", js);
    gulp.watch("img/**/*.{png,jpg}", allimg);
    gulp.watch("img/**/*.{svg}", svg);

}


gulp.task('styles', styles);
gulp.task('html', html);
gulp.task('js', js);
gulp.task('css', css);
gulp.task('allimg', allimg);
gulp.task('images', images);
gulp.task('svg', svg);
gulp.task('watch', watch);
gulp.task('build', gulp.series(clean,copy,
                        gulp.parallel(styles,images,svg)));


function copy() {
    return gulp.src([
        'img/**',
        'js/**',
        'css/**',
        '*.html'
    ], {
        base: '.'
    })
        .pipe(dest('build'));
}
gulp.task('copy', copy);

function clean() {
    return del('build');
}
gulp.task('clean', clean);
