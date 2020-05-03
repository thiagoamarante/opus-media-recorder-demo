var gulp = require('gulp');
var concat = require('gulp-concat');
var combiner = require('stream-combiner2');
var uglify = require('gulp-uglify');   //js压缩
var gutil = require('gulp-util');
var babel = require("gulp-babel");

var sourcemaps = require('gulp-sourcemaps')
var javascriptObfuscator = require('gulp-javascript-obfuscator');   //js压缩混淆的gulp插件

var releaseList = [
    './public/event-target-shim.js',
    './public/detect-browser.js',
    './public/OpusMediaRecorder.js',
    './public/encoderWorker.js'
]

var handleError = function (err) {
    var colors = gutil.colors;
    console.log('\n');
    gutil.log(colors.red('Error!'));
    gutil.log('fileName: ' + colors.red(err.fileName));
    gutil.log('lineNumber: ' + colors.red(err.lineNumber));
    gutil.log('message: ' + err.message);
    gutil.log('plugin: ' + colors.yellow(err.plugin))
}

gulp.task('build', function (done) {
    var combined = combiner.obj([
        gulp.src(releaseList)
            // .pipe(babel())
            // .pipe(uglify())
            .pipe(concat('opusMediaRecorder.js'))         // 按照[]里的顺序合并文件
            .pipe(gulp.dest('./dist'))
    ])
    combined.on('error', handleError)
    done();
})

gulp.task('default', gulp.series('build', function(done) {
    // Do something after a, b, and c are finished.
    console.log( "gulp default task" );
    done();
}));