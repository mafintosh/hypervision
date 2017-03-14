var html = require('choo/html')
var onload = require('on-load')

var producer = require('hypercore')(require('level')('producer.db'))
var desktopCapturer = require('electron').desktopCapturer
var recorder = require('media-recorder-stream')
var cluster = require('webm-cluster-stream')
var raf = require('random-access-file')

var $ = document.getElementById.bind(document)

var mediaStream, stream, feed, swarm

module.exports = function (state, prev, send) {
  var settings = html`
    <div class="header-section">
      <div class="header-quality" onclick=${ swapQuality }>
        ${ qualityLabel() } quality
      </div>

      <div class="header-device" onclick=${ swapDevice }>
        ${ deviceLabel() }
      </div>
    </div>
  `

  var div = html`
    <main onmouseover=${ hoverEnter } onmouseout=${ hoverLeave }>
      <div class="preview">
        <video class="preview-video" id="player" muted autoplay></video>
      </div>
      <div class="overlay" id="overlay">
        <div class="header">
          <div class="header-section">
            <div class="header-status" style="background-color: ${ state.live ? '#F9364E' : '#999999' }">
              ${ state.live ? 'ON' : 'OFF'} AIR
            </div>

            <div class="header-start" style="background-color: ${ state.live ? '#FFA0AC' : '#3ABFA1' }" onclick=${ state.live ? stopBroadcast : startBroadcast }>
              ${ state.live ? 'Stop' : 'Start'}
            </div>
          </div>

          ${ state.live ? null : settings }
        </div>

        <div class="footer">
          <a href="/" class="footer-button">Back to menu</div>
          <div class="footer-share">
            <span class="footer-share-label">Share</span>
            <input id="share" class="footer-share-input" readonly />
          </div>
        </div>
      </div>
    </main>
  `

  // attach view lifecycle functions
  onload(div, load, unload)

  // return function to router
  return div

  // when view finishes loading
  function load () {
    navigator.webkitGetUserMedia({
      audio: true,
      video: true,
    }, function (media) {
      window.media = media
      $('player').srcObject = media
    }, function (err) {
      if (err) console.log('error: ', err)
    })
  }

  // when view finishes unloading
  function unload () {
    stopTracks()
  }

  function qualityLabel () {
    var quality = state.quality
    return (quality === 1) ? 'Low' : (quality === 2) ? 'Medium' : 'High'
  }

  function deviceLabel () {
    var device = state.device
    return (device === 'webcam') ? 'Screen' : 'Webcam'
  }

  // stop all audio & video tracks
  function stopTracks () {
    var videoTracks = window.media.getVideoTracks()
    var audioTracks = window.media.getAudioTracks()

    videoTracks.forEach(function (track) { track.stop() })
    audioTracks.forEach(function (track) { track.stop() })
  }

  // swap between webcam and screen capture
  function swapDevice () {
    stopTracks()

    if (state.device === 'webcam') {
      // screen capture doesn't support audio, so we
      // append an audio track onto the video track
      var audioConstr = { audio: true }
      navigator.webkitGetUserMedia(audioConstr, function (audioStream) {
        var screenConst = {
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'screen',
              maxWidth: 1920,
              maxHeight: 1080,
              maxFrameRate: 25
            }
          }
        }
        navigator.webkitGetUserMedia(screenConst, function (media) {
          media.addTrack(audioStream.getAudioTracks()[0])
          window.media = media
          $('player').srcObject = media
        }, gumError)
      }, gumError)
    } else {
      navigator.webkitGetUserMedia({
        audio: true,
        video: { maxFrameRate: 25 },
      }, function (media) {
        window.media = media
        $('player').srcObject = media
      }, gumError)
    }
    send('swapDevice')
  }

  // error handling for `getUserMedia`
  function gumError (err) {
    if (err) console.log('err: ', err)
  }

  // when user changes stream quality
  function swapQuality () {
    send('swapQuality')
  }

  // when user starts broadcast
  function startBroadcast () {
    send('toggleLive', true)

    // create bitrate options
    var quality = state.quality
    var video = quality.high ? 800000 : quality.medium ? 500000 : 200000
    var audio = quality.high ? 128000 : quality.medium ? 64000 : 32000

    var opts = {
      interval: 1000,
      videoBitsPerSecond: video,
      audioBitsPerSecond: audio,
    }

    // create a MediaRecorder
    mediaStream = recorder(media, opts)

    // pipe MediaRecorder to webm transform
    stream = mediaStream.pipe(cluster())

    // create a new feed
    feed = producer.createFeed({
      storage: raf('producer.data/' + Date.now() + '.feed')
    })

    // join p2p swarm
    swarm = require('hyperdrive-archive-swarm')(feed)

    // append any new video to feed
    stream.on('data', function (data) {
      console.log(data.length, Math.floor(data.length / 16 / 1024), Math.floor(data.length / 10))
      feed.append(data)
    })

    // show user their stream's hash
    $('share').value = feed.key.toString('hex')
  }

  // when user stops broadcast
  function stopBroadcast () {
    send('toggleLive', false)

    // clear share input
    $('share').value = ''

    // close the stream
    mediaStream.destroy()
    stream.end()
    feed.close()
    swarm.close()
  }

  // when user's mouse enters window
  function hoverEnter () {
    $('overlay').style = "opacity: 1"
  }

  // when user's mouse leaves window
  function hoverLeave () {
    $('overlay').style = "opacity: 0"
  }
}
