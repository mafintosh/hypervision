var html = require('choo/html')
var choo = require('choo')
var app = choo()

var onload = require('on-load')

var desktopCapturer = require('electron').desktopCapturer
var recorder = require('media-recorder-stream')
var cluster = require('webm-cluster-stream')
var eos = require('end-of-stream')
var fs = require('fs')
var raf = require('random-access-file')

var $ = document.querySelector.bind(document)

function noop () {}
var feed
var stream
var swarm
var blah
var server

app.model({
  state: {
    live: false,
    quality: 3,
    device: 'webcam'
   },
  reducers: {
    toggleLive: function (state, data) {
      return { live: data }
    },
    swapDevice: function (state, data) {
      var device = state.device
      return { device: (device === 'webcam') ? 'screen' : 'webcam' }
    },
    swapQuality: function (state, data) {
      var quality = state.quality
      return { quality: (quality === 1) ? 3 : (quality - 1) }
    }
  }
})

app.router([
  ['/', require('./components/home')],
  ['/broadcast', require('./components/broadcast')],
  ['/view', require('./components/viewer')]
])

document.body.appendChild(app.start())
