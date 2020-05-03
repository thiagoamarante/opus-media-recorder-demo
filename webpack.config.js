var path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var releaseList = [
    './public/event-target-shim.js',
    './public/detect-browser.js',
    './public/OpusMediaRecorder.js',
    './public/encoderWorker.js'
]

// var releaseList = ['./dist/opusMediaRecorder.js']

module.exports = {
    entry:{
        index: releaseList,
    },
    output: {
        filename:'opusMediaRecorder.min.js',
        path: path.resolve(__dirname,'dist'),
        publicPath: '/dist'
    },
    optimization: {
        minimizer: [new UglifyJsPlugin({
            test         : /\.js($|\?)/i,
            sourceMap    : false,
            uglifyOptions: {
                define: true,
                ecma    : 6,
                mangle  : false,   // 混淆
                compress:  false,      // 压缩
                comments: "all",
                warnings: true,
            }
        })],
    },
    mode: 'development' // 设置mode
}