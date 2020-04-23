// Non-standard options
const workerOptions = {
    OggOpusEncoderWasmPath: 'https://cdn.jsdelivr.net/npm/opus-media-recorder@0.7.19/OggOpusEncoder.wasm',
    WebMOpusEncoderWasmPath: 'https://cdn.jsdelivr.net/npm/opus-media-recorder@0.7.19/WebMOpusEncoder.wasm'
};

// Polyfill MediaRecorder
window.MediaRecorder = OpusMediaRecorder;

// Recorder object
let recorder;
let mimeSelect = document.querySelector('#mimeSelect');
let mimeSelectValue = '';
mimeSelect.onchange = (e) => {
    mimeSelectValue = e.target.value;
};
let timeSlice = document.querySelector('#timeSlice');
// Player
let player = document.querySelector('#player');
let link = document.querySelector('#link');

function createMediaRecorder(stream) {
    // Create recorder object
    let options = {mimeType: mimeSelectValue};
    recorder = new MediaRecorder(stream, options, workerOptions);

    let dataChunks = [];
    // Recorder Event Handlers
    recorder.onstart = _ => {
        dataChunks = [];
        console.log('Recorder started');
    };
    recorder.ondataavailable = (e) => {
        dataChunks.push(e.data);
        console.log('Recorder data available');
    };
    recorder.onstop = (e) => {
        // When stopped add a link to the player and the download link
        console.warn("recorder: ", recorder)
        let blob = new Blob(dataChunks, {'type': recorder.mimeType});
        dataChunks = [];
        let audioURL = URL.createObjectURL(blob);
        player.src = audioURL;
        link.href = audioURL;
        let extension = recorder.mimeType.match(/ogg/) ? '.ogg'
            : recorder.mimeType.match(/webm/) ? '.webm'
                : recorder.mimeType.match(/wav/) ? '.wav'
                    : '';
        link.download = 'recording' + extension;

        console.log('Recorder stopped');
    };
    recorder.onpause = _ => console.log('Recorder paused');
    recorder.onresume = _ => console.log('Recorder resumed');
    recorder.onerror = e => console.log('Recorder encounters error:' + e.message);

    return stream;
};

/*******************************************************************************
 * file upload
 *    This section is only for file upload
 ******************************************************************************/

var uploadFile = document.getElementById('uploadFile')
var contentAudio = document.getElementById('audio')
var audioStream
var file
var fileURL

/***
 * 上传本地音视频
 */
uploadFile.addEventListener('change', async function () {
    try {
        file = document.getElementById("uploadFile").files[0];
        fileURL = getObjectURL(file);
        var typeJudge = file.type.split("/")[0];
        if (typeJudge === "audio" || typeJudge === "video") {
            contentAudio.setAttribute('src',fileURL);
            this.value = "";  // clear input
            if(contentAudio.captureStream){
                audioStream = contentAudio.captureStream(5);
            }else if(contentAudio.mozCaptureStream){
                audioStream = contentAudio.mozCaptureStream(5);
            }else {
                console.warn('Current browser does not support captureStream!!')
                return
            }
            contentAudio.play();
        } else {
            console.warn("only support upload video or audio, please try again！");
        }
    } catch (e) {
        console.error(e.message);
    }
})

/**
 * audio 加载完成
 */
contentAudio.oncanplay = function () {
    var promise = new Promise(function(resolve, reject) {
        resolve(audioStream);
    });

    promise.then(createMediaRecorder)
        .catch(e => {
            console.log(`MediaRecorder is failed: ${e.message}`);
            Promise.reject(new Error());
        })
        .then(printStreamInfo) // Just for debugging purpose.
        .then(_ =>{
                console.log('Creating MediaRecorder is successful.')
            // start recorder
            recorder.start(timeSlice.value)
            var interVal = setInterval(function () {
                var time = parseInt(contentAudio.currentTime)
                if(time === 30){
                    // stop recorder
                    recorder.stop()
                    clearInterval(interVal)
                }
            }, 1)
        })
}

/***
 * get file url
 * @param file
 * @returns {*}
 */
function getObjectURL(file){
    var url = null;
    if (window.createObjectURL !== undefined) { // basic
        url = window.createObjectURL(file);
    } else if (window.URL !== undefined) { // mozilla(firefox)
        url = window.URL.createObjectURL(file);
    } else if (window.webkitURL !== undefined) { // webkit or chrome
        url = window.webkitURL.createObjectURL(file);
    }
    return url;
}


/*******************************************************************************
 * End of file upload
 ******************************************************************************/

// Check platform
window.addEventListener('load', function checkPlatform() {
    // Check compatibility
    if (OpusMediaRecorder === undefined) {
        console.error('No OpusMediaRecorder found');
    } else {
        // Check available content types
        let contentTypes = [
            'audio/wave',
            'audio/wav',
            'audio/ogg',
            'audio/ogg;codecs=opus',
            'audio/webm',
            'audio/webm;codecs=opus'
        ];
        contentTypes.forEach(type => {
            console.log(type + ' is ' +
                (MediaRecorder.isTypeSupported(type)
                    ? 'supported' : 'NOT supported'));
        });
    }
}, false);


/*******************************************************************************
 * Debug helpers
 *    This section is only for debugging purpose, library users don't need them.
 ******************************************************************************/
// Monkey-patching console.log for debugging.
document.addEventListener('DOMContentLoaded', (e) => {
    let lineCount = 0;

    function overrideConsole(oldFunction, divLog) {
        return function (text) {
            oldFunction(text);
            lineCount += 1;
            if (lineCount > 100) {
                let str = divLog.innerHTML;
                divLog.innerHTML = str.substring(str.indexOf('<br>') + '<br>'.length);
            }
            divLog.innerHTML += text + '<br>';
        };
    };

    console.log = overrideConsole(console.log.bind(console), document.getElementById('errorLog'));
    console.error = overrideConsole(console.error.bind(console), document.getElementById('errorLog'));
    console.debug = overrideConsole(console.debug.bind(console), document.getElementById('errorLog'));
    console.info = overrideConsole(console.info.bind(console), document.getElementById('errorLog'));
}, false);

// Print any error
window.onerror = (msg, url, lineNo, columnNo, error) => {
    let substring = 'script error';
    if (msg.toLowerCase().indexOf(substring) > -1) {
        console.log('Script Error: See Browser Console for Detail');
    } else {
        let message = [
            'Message: ' + msg,
            'URL: ' + url,
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error)
        ].join(' - ');

        console.log(message);
    }
    return false;
};

// print stream information (for debugging)
function printStreamInfo(stream) {
    if(stream){
        for (const track of stream.getAudioTracks()) {
            console.log('Track Information:');
            for (const key in track) {
                if (typeof track[key] !== 'function') {
                    console.log(`\t${key}: ${track[key]}`);
                }
            }
            console.log('Track Settings:');
            let settings = track.getSettings();
            for (const key in settings) {
                if (typeof settings[key] !== 'function') {
                    console.log(`\t${key}: ${settings[key]}`);
                }
            }
        }
    }
}

/*******************************************************************************
 * End of debug helpers
 ******************************************************************************/