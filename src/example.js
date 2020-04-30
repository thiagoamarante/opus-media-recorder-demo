// Non-standard options
const workerOptions = {
    OggOpusEncoderWasmPath: 'https://cdn.jsdelivr.net/npm/opus-media-recorder@0.7.19/OggOpusEncoder.wasm'
};

// Polyfill MediaRecorder
window.MediaRecorder = OpusMediaRecorder;
// Recorder object
let recorder;
// Player
let player = document.querySelector('#player');
let link = document.querySelector('#link');

/**
 * create MediaRecorder instance
 * @param stream
 * @returns {*}
 */
function createMediaRecorder(stream) {
    // Create recorder object
    let options = {mimeType: 'audio/ogg'};
    recorder = new MediaRecorder(stream, options, workerOptions);

    let dataChunks = [];
    // Recorder Event Handlers
    recorder.onstart = _ => {
        dataChunks = [];
        console.warn('Recorder started');
    };
    recorder.ondataavailable = (e) => {
        console.log('Recorder data available ');
        dataChunks.push(e.data);
    };
    recorder.onstop = (e) => {
        // When stopped add a link to the player and the download link
        let blob = new Blob(dataChunks, {'type': recorder.mimeType});
        dataChunks = [];
        let audioURL = URL.createObjectURL(blob);
        player.src = audioURL;
        link.href = audioURL;
        let extension = recorder.mimeType.match(/ogg/) ? '.ogg'
            : recorder.mimeType.match(/webm/) ? '.webm'
                : recorder.mimeType.match(/wav/) ? '.wav'
                    : '';
        link.download = (fileName ? fileName : 'recording') + extension;
        console.log('Recorder stopped');

        if(!blob.size){
            throw new Error('Exception: Blob is empty')
        }
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

let uploadFile = document.getElementById('uploadFile')
let audioElement = document.getElementById('audio')
let audioStream
let file
let fileName
let endTime = 30     // 设置音频 recorder 时长

// 用于处理上传的音频文件
let AudioContext = window.AudioContext || window.webkitAudioContext || false;
let audioCtx;
let soundSource;
let destination;
let fileReader = new FileReader();

/**
 * Upload local audio file
 * 使用FileReader读取上传文件，转换为stream
 */
uploadFile.addEventListener('change', async function () {
    try {
        file = this.files[0];
        fileName = file.name.split('.')[0]
        audioCtx = new AudioContext();
        fileReader.file = file;
        fileReader.onload = (function(e) {
            audioCtx.decodeAudioData(e.target.result, createSoundSource);
        });
        fileReader.readAsArrayBuffer(fileReader.file);
    } catch (e) {
        console.error(e.message);
    }
})

/**
 * 通过AudioContext.createMediaStreamDestination 生成文件流
 * @param buffer
 */
function createSoundSource(buffer) {
    soundSource = audioCtx.createBufferSource();
    soundSource.buffer = buffer;
    destination = audioCtx.createMediaStreamDestination();
    soundSource.connect(destination);
    soundSource.start(0, 0 / 1000);

    audioStream = destination.stream
    audioElement.srcObject = audioStream
}

/**
 * audio load complete
 */
audioElement.addEventListener('canplay', function () {
    try {
        if(audioStream){
            createMediaRecorder(audioStream)
            console.log('Creating MediaRecorder is successful.Start recorder...')
            console.log('start recorder')
            recorder.start()
            // Just for debugging purpose.
            printStreamInfo(audioStream)
        }
    }catch (e) {
        console.log(`MediaRecorder is failed: ${e.message}`);
        Promise.reject(new Error());
    }
})

/**
 * Duration monitoring: When the audio playback duration reaches the set end time, stop the recorder
 */
audioElement.addEventListener("timeupdate", function () {
    if (endTime >0  && audioElement.currentTime >= endTime) {
        audioElement.pause()
        if(recorder._state !== 'inactive'){
            console.log('stop recorder')
            recorder.stop()
        }
    }
});

/**
 * When the uploaded file is less than 30s, after audio playback ends, stop the recorder
 */
audioElement.addEventListener("ended", function () {
    if(recorder._state !== 'inactive'){
        console.log("audio play onended")
        recorder.stop()
    }
});

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
        contentTypes.forEach(function (type) {
            console.log(type + ' is ' + (MediaRecorder.isTypeSupported(type) ? 'supported' : 'NOT supported'));
        });
    }
}, false);

/***
 * get file url
 * @param file
 * @returns {*}
 */
function getObjectURL(file){
    let url = null;
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
 * Debug helpers
 *    This section is only for debugging purpose, library users don't need them.
 ******************************************************************************/
// Monkey-patching console.log for debugging.
document.addEventListener('DOMContentLoaded', (e) => {
    let lineCount = 0;
    let errorLog = document.getElementById('errorLog')
    if(errorLog){
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

        console.log = overrideConsole(console.log.bind(console), errorLog);
        console.error = overrideConsole(console.error.bind(console), errorLog);
        console.debug = overrideConsole(console.debug.bind(console), errorLog);
        console.info = overrideConsole(console.info.bind(console), errorLog);
    }
}, false);

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