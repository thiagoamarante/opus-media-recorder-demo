// Non-standard options
const workerOptions = {
    OggOpusEncoderWasmPath: 'https://cdn.jsdelivr.net/npm/opus-media-recorder@0.7.19/OggOpusEncoder.wasm'
};
window.MediaRecorder = OpusMediaRecorder;

// Player
let player = document.querySelector('#player');
let link = document.querySelector('#link');
let uploadFile = document.getElementById('uploadFile')

// create audio element
let audioElement = document.createElement('audio')
audioElement.setAttribute('id', 'audio')
audioElement.muted = true
audioElement.autoplay = true

let audioStream
let fileName
let endTime = 30     // 设置音频 recorder 时长

// 用于处理上传的音频文件
let audioCtx;
let soundSource;
let destination;
let fileReader;
let recorder;

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
        link.download = (fileName ? fileName : 'recording') + '.ogg';
        console.log('Recorder stopped');

        if(!blob.size){
            throw new Error('Exception: Blob is empty')
        }
    };
    recorder.onpause = _ => console.log('Recorder paused');
    recorder.onresume = _ => console.log('Recorder resumed');
    recorder.onerror = e => console.log('Recorder encounters error:' + e.message);

    return stream;
}

/**
 * 通过AudioContext.createMediaStreamDestination 生成文件流
 * @param buffer
 */
function createSoundSource(buffer) {
    soundSource = audioCtx.createBufferSource();
    soundSource.buffer = buffer;
    destination = audioCtx.createMediaStreamDestination();
    soundSource.connect(destination);
    soundSource.start();

    audioStream = destination.stream
    audioElement.srcObject = audioStream
}

/**
 * Upload local audio file
 * 使用FileReader读取上传文件，转换为stream
 */
uploadFile.addEventListener('change', async function () {
    try {
        let file = this.files[0];
        fileName = file.name.split('.')[0]
        audioCtx = new AudioContext();
        fileReader = new FileReader()
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
 * audio load complete
 */
audioElement.addEventListener('canplay', function () {
    try {
        if(audioStream){
            createMediaRecorder(audioStream)
            console.log('Creating MediaRecorder is successful, Start recorder...')
            recorder.start()
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

// Check platform
window.addEventListener('load', function() {
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