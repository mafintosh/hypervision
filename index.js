var html = require('choo/html')
var choo = require('choo')
var app = choo()

app.model({
  state: {
    live: false,
    quality: 3,
    sources: {
      available: { video: [], audio: [] },
      selected: { video: null, audio: null }
    }
   },
  reducers: {
    liveToggle: function (state, data) {
      return { live: data }
    },
    qualityToggle: function (state, data) {
      var quality = state.quality
      return { quality: (quality === 1) ? 3 : (quality - 1) }
    },
    sourcesAvailable: function (state, data) {
      var selected = state.sources.selected
      return {
        sources: {
          available: {
            video: data.video,
            audio: data.audio
          },
          selected: selected,
        }
      }
    },
    sourcesSelect: function (state, data) {
      var available = state.sources.available
      return {
        sources: {
          available: available,
          selected: {
            video: data.video,
            audio: data.audio
          }
        }
      }
    }
  }
})

app.router([
  ['/', require('./components/home')],
  ['/broadcast', require('./components/broadcast')],
  ['/view', require('./components/viewer')],
  ['/settings', require('./components/settings')]
])

document.body.appendChild(app.start())
