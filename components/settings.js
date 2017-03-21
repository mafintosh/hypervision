var html = require('choo/html')
var onload = require('on-load')

var mediaDevices = require('../lib/media-devices')

var $ = document.getElementById.bind(document)

module.exports = function (state, emit) {
  var available = state.sources.available
  var selected = state.sources.selected

  var div = html`
    <main class="settings">
      <div class="sources-video">
        <div class="sources-title">Video source</div>
        <select class="choose" id="videoinput">
          ${ available.video.map(function (device) {
            if (selected.video && (selected.video.deviceId === device.deviceId)) {
              return html`<option selected>${ device.label }</option>`
            } else {
              return html`<option>${ device.label }</option>`
            }
          })}
        </select>
      </div>
      <div class="sources-audio">
        <div class="sources-title">Audio source</div>
        <select class="choose" id="audioinput">
        ${ available.audio.map(function (device) {
          if (selected.audio && (selected.audio.deviceId === device.deviceId)) {
            return html`<option selected>${ device.label }</option>`
          } else {
            return html`<option>${ device.label }</option>`
          }
        })}
        </select>
      </div>
      <div onclick=${ done } class="footer-button">Done</div>
    </main>
  `

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

    emit('location:set', `/broadcast`)
  }
}
