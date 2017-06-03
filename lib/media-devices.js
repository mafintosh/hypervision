var desktopCapturer = require('electron').desktopCapturer

module.exports = {
  get: get,
  start: start,
  stop: stop
}

// get list of media inputs connected to computer
function get (done) {
  desktopCapturer.getSources({types: ['window', 'screen']}, (err, sources) => {
    navigator.mediaDevices.enumerateDevices()
    .then(function (devices) {
      
      // Treat the screen capture sources as media devices
      sources.forEach(function (source) {
        source.label = source.name
        if (source.label.length > 26) {
          source.label =  source.label.substr(0, 26)+'...'
        }
        source.kind = 'screen'
        devices.push(source)
      })
      
      done(null, devices)
    })
    .catch(function (err) {
      done(err)
    })
  })
}

function start (videoDevice, audioDevice, cb) {
  var videoOpts = { video: true }
  var audioOpts = { audio: true }

  if (videoDevice) {
    // if user has selected 'screen sharing'
    if (videoDevice.kind === 'screen') {
      videoOpts = {
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: videoDevice.id,
            maxWidth: 1920,
            maxHeight: 1080,
            maxFrameRate: 25
          }
        }
      }
    } else {
      videoOpts = { video: { deviceId: { exact: videoDevice.deviceId } } }
    }
    audioOpts = { audio: { deviceId: { exact: audioDevice.deviceId } } }
  }

  // add audio stream to video stream
  // (allows screen sharing with audio to work)
  navigator.webkitGetUserMedia(audioOpts, function (audioStream) {
    navigator.webkitGetUserMedia(videoOpts, function (mediaStream) {
      mediaStream.addTrack(audioStream.getAudioTracks()[0])
      cb(mediaStream)
    }, error)
  }, error)
}

// stop all media devices
function stop () {
  var video = window.stream.getVideoTracks()
  var audio = window.stream.getAudioTracks()

  video.forEach(function (track) { track.stop() })
  audio.forEach(function (track) { track.stop() })
}


// error handling for `getUserMedia`
function error (err) {
  if (err) console.log('err: ', err)
}
