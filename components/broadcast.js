var html = require('choo/html')
var onload = require('on-load')

var hypercore = require('hypercore')
var hyperdiscovery = require('hyperdiscovery')
var desktopCapturer = require('electron').desktopCapturer
var recorder = require('media-recorder-stream')
var cluster = require('webm-cluster-stream')
var pump = require('pump')

var $ = document.getElementById.bind(document)

var mediaStream, swarm

module.exports = function (state, prev, send) {
  var settings = html`
    <div class="header-section">
      <div class="header-quality" onclick=${ qualityToggle }>
        ${ qualityLabel() } quality
      </div>

      <a href="/settings" class="header-device">
        Settings
      </a>
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
          <a href="/" class="footer-button">Back to menu</a>
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

  // when view finishes loading, turn on video/audio inputs
  function load () {
    var videoDevice = state.sources.selected.video
    var audioDevice = state.sources.selected.audio

    var videoOpts = { video: true }
    var audioOpts = { audio: true }

    if (state.sources.selected.video) {
      // if user has selected 'screen sharing'
      if (videoDevice.kind === 'screen') {
        videoOpts = {
          video: {
            mandatory: {
              chromeMediaSource: 'screen',
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
      navigator.webkitGetUserMedia(videoOpts, function (media) {
        media.addTrack(audioStream.getAudioTracks()[0])
        window.media = media
        $('player').srcObject = media
      }, gumError)
    }, gumError)
  }

  // when view finishes unloading, stop all audio & video tracks
  function unload () {
    var videoTracks = window.media.getVideoTracks()
    var audioTracks = window.media.getAudioTracks()

    videoTracks.forEach(function (track) { track.stop() })
    audioTracks.forEach(function (track) { track.stop() })
  }

  function qualityLabel () {
    var quality = state.quality
    return (quality === 1) ? 'Low' : (quality === 2) ? 'Medium' : 'High'
  }

  // error handling for `getUserMedia`
  function gumError (err) {
    if (err) console.log('err: ', err)
  }

  // when user changes stream quality
  function qualityToggle () {
    send('qualityToggle')
  }

  // when user starts broadcast
  function startBroadcast () {
    send('liveToggle', true)

    // create bitrate options
    var quality = state.quality
    var video = (quality === 3) ? 800000 : (quality === 2) ? 500000 : 200000
    var audio = (quality === 3) ? 128000 : (quality === 2) ? 64000 : 32000

    // create a MediaRecorder
    var opts = {
      interval: 1000,
      videoBitsPerSecond: video,
      audioBitsPerSecond: audio,
    }
    mediaStream = recorder(media, opts)

    // create a new feed
    var feed = hypercore(`./streams/broadcasted/${ Date.now ()}`)

    // when feed is ready
    feed.on('ready', function () {
      // join p2p swarm
      swarm = hyperdiscovery(feed)
      // show user their stream's hash
      $('share').value = feed.key.toString('hex')
    })

    // pipe MediaRecorder to webm transform.
    // when MediaRecorder is destroyed, close feed and swarm.
    var stream = pump(mediaStream, cluster(), function (err) {
      if (err) console.log('err: ', err)
      swarm.close()
      feed.close(function (err) { if (err) console.log('err: ', err) })
    })

    // append any new video to feed
    stream.on('data', function (data) {
      console.log(data.length, Math.floor(data.length / 16 / 1024), Math.floor(data.length / 10))
      feed.append(data)
    })
  }

  // when user stops broadcast
  function stopBroadcast () {
    send('liveToggle', false)

    // clear share input
    $('share').value = ''

    // destory MediaRecorder
    mediaStream.stop()
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
