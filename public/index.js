
// Player
let player = document.querySelector('#player');
let link = document.querySelector('#link');
let uploadFile = document.getElementById('uploadFile')
let audioElement = document.getElementById('audio')
let audioStream
let fileName
// 用于处理上传的音频文件
let audioCtx;
let RECORDER;


// Non-standard options
const workerOptions = {
    OggOpusEncoderWasmPath: 'https://cdn.jsdelivr.net/npm/opus-media-recorder@0.7.19/OggOpusEncoder.wasm'
};
window.MediaRecorder = OpusMediaRecorder;
/**
 * create MediaRecorder instance
 * @param stream
 * @param duration
 * @returns {*}
 */
function createMediaRecorder(stream, duration) {
    // Create recorder object
    let options = {mimeType: 'audio/ogg'};
    let recorder = new MediaRecorder(stream, options, workerOptions, duration);

    let dataChunks = [];
    // Recorder Event Handlers
    recorder.onstart = function(){
        dataChunks = [];
        console.warn('Recorder started');
    }

    recorder.ondataavailable = function(e){
        console.log('Recorder data available ');
        dataChunks.push(e.data);
    }

    recorder.onstop = function(){
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
    }

    recorder.onpause = function(){
        console.log('Recorder paused')
    }

    recorder.onresume = function(){
        console.log('Recorder resumed')
    }

    recorder.onerror = function (error) {
        if (!error) {
            return;
        }

        if (!error.name) {
            error.name = 'UnknownError';
        }

        if (error.name.toString().toLowerCase().indexOf('invalidstate') !== -1) {
            console.error('The MediaRecorder is not in a state in which the proposed operation is allowed to be executed.', error);
        } else if (error.name.toString().toLowerCase().indexOf('notsupported') !== -1) {
            console.error('MIME type (', options.mimeType, ') is not supported.', error);
        } else if (error.name.toString().toLowerCase().indexOf('security') !== -1) {
            console.error('MediaRecorder security error', error);
        }

        // older code below
        else if (error.name === 'OutOfMemory') {
            console.error('The UA has exhaused the available memory. User agents SHOULD provide as much additional information as possible in the message attribute.', error);
        } else if (error.name === 'IllegalStreamModification') {
            console.error('A modification to the stream has occurred that makes it impossible to continue recording. An example would be the addition of a Track while recording is occurring. User agents SHOULD provide as much additional information as possible in the message attribute.', error);
        } else if (error.name === 'OtherRecordingError') {
            console.error('Used for an fatal error other than those listed above. User agents SHOULD provide as much additional information as possible in the message attribute.', error);
        } else if (error.name === 'GenericError') {
            console.error('The UA cannot provide the codec or recording option that has been requested.', error);
        } else {
            console.error('MediaRecorder Error', error);
        }

        console.error('Recorder encounters error:' + error.message)
        if (recorder._state !== 'inactive' && recorder._state !== 'stopped') {
            recorder.stop();
        }
    };

    return recorder
}

/**
 * 通过AudioContext.createMediaStreamDestination 生成文件流
 * @param buffer
 */
function createSoundSource(buffer) {
    let soundSource = audioCtx.createBufferSource();
    soundSource.buffer = buffer;
    let destination = audioCtx.createMediaStreamDestination();
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
        let fileReader = new FileReader()
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
            let recordingDuration = 30000
            RECORDER = createMediaRecorder(audioStream, recordingDuration)
            console.log('Creating MediaRecorder is successful, Start recorder...')
            RECORDER.startRecording()
        }
    }catch (e) {
        console.log(`MediaRecorder is failed: ${e.message}`);
        Promise.reject(new Error());
    }
})

/**
 * When the uploaded file is less than 30s, after audio playback ends, stop the recorder
 */
audioElement.addEventListener("ended", function () {
    if(RECORDER._state !== 'inactive' && RECORDER._state !== 'stopped'){
        RECORDER.stopRecording()
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