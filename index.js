var html = require('choo/html')
var choo = require('choo')
var app = choo()

app.use(function (state, emitter) {

   state.live = false
   state.quality = 3
   state.sources = {
     available: { video: [], audio: [] },
     selected: { video: null, audio: null }
   }

   emitter.on('liveToggle', function (bool) {
     state.live = bool

     emitter.emit('render')
   })

   emitter.on('qualityToggle', function () {
     var quality = state.quality
     state.quality = (quality === 1) ? 3 : (quality - 1)

     emitter.emit('render')
   })

   emitter.on('sourcesAvailable', function (data) {
     state.sources.available = {
       video: data.video,
       audio: data.audio
     }

     emitter.emit('render')
   })

   emitter.on('sourcesSelect', function (data) {
     state.sources.selected = {
       video: data.video,
       audio: data.video
     }

     emitter.emit('render')
   })
})

app.route('/', require('./components/home'))
app.route('/broadcast', require('./components/broadcast'))
app.route('/view', require('./components/viewer'))
app.route('/settings', require('./components/settings'))

document.body.appendChild(app.start())
