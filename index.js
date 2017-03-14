var html = require('choo/html')
var choo = require('choo')
var app = choo()

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
