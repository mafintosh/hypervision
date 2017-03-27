var choo = require('choo')
var html = require('choo/html')
var css = require('sheetify')

var app = choo()

app.use(function (state, emitter) {
  // initial state
  state.watch = ''
  state.live = false
  state.quality = 3
  state.sources = {
    available: { video: [], audio: [] },
    selected: { video: null, audio: null }
  }

  // toggle when starting/stopping broadcast
  emitter.on('liveToggle', function (bool) {
    state.live = bool

    emitter.emit('render')
  })

  // sets broadcast bitrate
  emitter.on('qualityToggle', function () {
    var quality = state.quality
    state.quality = (quality === 1) ? 3 : (quality - 1)

    emitter.emit('render')
  })

  // sets available sources for broadcasting
  emitter.on('sourcesAvailable', function (data) {
    state.sources.available = {
      video: data.video,
      audio: data.audio
    }

    emitter.emit('render')
  })

  // select broadcast sources
  emitter.on('sourcesSelect', function (data) {
    state.sources.selected = {
      video: data.video,
      audio: data.audio
    }

    emitter.emit('pushState', '/broadcast')
  })

  // watch stream
  emitter.on('watch', function (data) {
    state.watch = data
  })

  // redirect utility
  emitter.on('redirect', function (data) {
    emitter.emit('pushState', data)
  })
})

// import base stylesheet
css('./style.css')

// routes
app.route('/', require('./components/home'))
app.route('/broadcast', require('./components/broadcast'))
app.route('/view', require('./components/viewer'))
app.route('/settings', require('./components/settings'))

// start!
document.body.appendChild(app.start())
