var html = require('choo/html')
var onload = require('on-load')
var css = require('sheetify')

var button = require('./button')

var mediaDevices = require('../lib/media-devices')

var $ = document.getElementById.bind(document)

var style = css`
  :host {
    background: var(--color-off-white);

    .video { margin: 0 0 1rem 0; }
    .audio { margin: 0 0 2rem 0; }
    .title { margin: 0 0 0.75rem 0; }

    select {
      -webkit-appearance: none;
      background: var(--color-white);
      padding: 0.4rem 0 0.4rem 0.65rem;
      border-radius: 2px;
      border: none;
      width: 13rem;
      font-size: 16px;
      color: var(--color-font-black);
      letter-spacing: -0.04rem;
      font-weight: 500;
    }
  }
`

module.exports = function (state, emit) {
  var available = state.sources.available
  var selected = state.sources.selected

  var div = html`
    <main class=${ style }>
      <div class="video">
        <label class="title">Video source</label>
        <select id="videoinput">
          ${ available.video.map(videoOptions) }
        </select>
      </div>

      <div class="audio">
        <label class="title">Audio source</label>
        <select id="audioinput">
          ${ available.audio.map(audioOptions) }
        </select>
      </div>

      ${ button('grey', 'Done', done) }
    </main>
  `

  // populate <option>'s for video device list
  function videoOptions (device, i) {
    var video = selected.video && (selected.video.deviceId === device.deviceId)

    if (video || (!video && (i === 0))) {
      return html`<option selected>${ device.label }</option>`
    } else {
      return html`<option>${ device.label }</option>`
    }
  }

  // populate <option>'s for audio device list
  function audioOptions (device) {
    var audio = selected.audio && (selected.audio.deviceId === device.deviceId)

    if (audio || (!audio && (i === 0))) {
      return html`<option selected>${ device.label }</option>`
    } else {
      return html`<option>${ device.label }</option>`
    }
  }

  // attach view lifecycle functions
  onload(div, load)

  // return function to router
  return div

  // when view finishes loading
  function load () {
    // if user hasn't previously selected any source inputs
    if (!state.sources.selected.video) {
      // get list of available source inputs
      mediaDevices.get(function (err, devices) {
        if (err) console.log('error: ', err)

        var videoDevices = []
        var audioDevices = []

        devices.forEach(function (device) {
          var kind = device.kind

          if (kind === 'videoinput') videoDevices.push(device)
          if (kind === 'audioinput') audioDevices.push(device)
        })

        // add a screen share video input to list
        videoDevices.push({
          deviceId: 'screen',
          kind: 'screen',
          label: 'Screen share'
        })

        emit('sourcesAvailable', {
          video: videoDevices,
          audio: audioDevices
        })
      })
    }
  }

  // when user closes settings menu, update state
  function done (e) {
    var video = $('videoinput').selectedIndex
    var audio = $('audioinput').selectedIndex

    var available = state.sources.available

    emit('sourcesSelect', {
      video: available.video[video],
      audio: available.audio[audio],
    })
  }
}
