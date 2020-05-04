let gulp = require('gulp');
let concat = require('gulp-concat');
let combiner = require('stream-combiner2');
let uglify = require('gulp-uglify');   //js压缩
let gutil = require('gulp-util');

let releaseList = [
    './public/event-target-shim.js',
    './public/detect-browser.js',
    './public/OpusMediaRecorder.js',
    './public/encoderWorker.js',
    './public/api.js'
]

let handleError = function (err) {
    let colors = gutil.colors;
    console.log('\n');
    gutil.log(colors.red('Error!'));
    gutil.log('fileName: ' + colors.red(err.fileName));
    gutil.log('lineNumber: ' + colors.red(err.lineNumber));
    gutil.log('message: ' + err.message);
    gutil.log('plugin: ' + colors.yellow(err.plugin))
}

gulp.task('build', function (done) {
    let combined = combiner.obj([
        gulp.src(releaseList)
            .pipe(concat('opusRecorder.js'))         // 按照[]里的顺序合并文件
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