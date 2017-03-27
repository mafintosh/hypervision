var html = require('choo/html')
var onload = require('on-load')
var css = require('sheetify')

var mediaDevices = require('../lib/media-devices')
var broadcast = require('../lib/broadcast')
var button = require('./button')

var $ = document.getElementById.bind(document)

module.exports = function (state, emit) {
  var divStyle = css`
    :host {
      .preview { width: 100%; }
      video { width: 100%; }

      .overlay {
        position: fixed;
        height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: rgba(256, 256, 256, 0.3);
        transition: opacity 0.5s;
      }

      .header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 1rem;
      }

      .section {
        display: flex;
        flex-direction: row;
      }

      .status {
        color: white;
        text-align: center;
        width: 4.2rem;
        border-radius: 2px;
        padding: 0.5rem 0.65rem 0.5rem 0.6rem;
        margin: 0 1rem 0 0;
      }

      .start {
        color: white;
        border-radius: 2px;
        padding: 0.5rem 0.65rem 0.5rem 0.6rem;
        margin: 0 3rem 0 0;
      }

      .footer {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 1rem;

        a {
          background: var(--color-grey);
          color: white;
          border-radius: 2px;
          padding: 0.5rem 0.65rem 0.5rem 0.6rem;
          text-decoration: none;
        }
      }

      .share {
        display: flex;
        flex-direction: row;
        align-items: center;

        span { padding: 0 1rem 0 0; }

        input {
          font-size: 16px;
          padding: 0.4rem 0 0.4rem 0.65rem;
          width: 14rem;
          border: none;
          border-radius: 2px;
        }
      }
    }
  `

  var div = html`
    <main class=${ divStyle } onmouseover=${ hoverEnter } onmouseout=${ hoverLeave }>
      <div class="preview">
        <video id="player" muted autoplay></video>
      </div>
      <div class="overlay" id="overlay">
        <div class="header">
          <div class="section">
            ${ button('grey', state.live ? 'ON AIR' : 'OFF AIR') }
            ${ button('green', state.live ? 'Stop' : 'Start', state.live ? stop : start) }
          </div>
          <div class="section">
            ${ button('pink', qualityLabel() + 'quality') }
            ${ button('pink', 'Settings') }
          </div>
        </div>

        <div class="footer">
          <a href="/">Back to menu</a>
          <div class="share">
            <span>Share</span>
            <input id="share" readonly />
          </div>
        </div>
      </div>
    </main>
  `

  // attach view lifecycle functions
  onload(div, load, unload)

  // return function to router
  return div

  // open media devices on entry
  function load () {
    var selected = state.sources.selected

    var video = selected.video
    var audio = selected.audio

    mediaDevices.start(video, audio, function (mediaStream) {
      window.stream = mediaStream
      $('player').srcObject = mediaStream
    })
  }

  // stop media devices on exit
  function unload () {
    mediaDevices.stop()
  }

  // start broadcast
  function start () {
    var quality = state.quality

    broadcast.start(quality, window.stream, function (mediaRecorder, hash) {
      window.recorder = mediaRecorder
      emit('liveToggle', true)
      // add hash to state
    })
  }

  // stop broadcast
  function stop () {
    broadcast.stop(window.recorder, function () {
      emit('liveToggle', false)
      // clear hash
    })
  }

  // when user changes stream quality
  function qualityToggle () {
    emit('qualityToggle')
  }

  function qualityLabel () {
    var quality = state.quality
    return (quality === 1) ? 'Low' : (quality === 2) ? 'Medium' : 'High'
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
