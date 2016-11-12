var $ = document.querySelector.bind(document)
var desktopCapturer = require('electron').desktopCapturer
var recorder = require('media-recorder-stream')
var cluster = require('webm-cluster-stream')
var eos = require('end-of-stream')
var fs = require('fs')
var raf = require('random-access-file')

function noop () {}

$('#record').onclick = function () {
  producer()
}

var interval = setInterval(function () { // yolo
  if ($('#link').value.length === 64) {
    clearInterval(interval)
    viewer($('#link').value)
  }
}, 100)

function producer () {
  desktopCapturer.getSources({types: ['screen']}, function (err, sources) {
    if (err) throw err
    navigator.webkitGetUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'screen',
          chromeMediaSourceId: sources[0].id,
          minFrameRate: 30
        }
      }
    }, function (media) {
      var stream = recorder(media, {interval: 1000}).pipe(cluster())
      var core = require('hypercore')(require('level')('producer.db'))
      var feed = core.createFeed({
        storage: raf('producer.data/' + Date.now() + '.feed')
      })

      document.body.innerHTML = feed.key.toString('hex')
      require('hyperdrive-archive-swarm')(feed)

      stream.on('data', function (data) {
        console.log(data.length)
        feed.append(data)
      })
    }, noop)
  })
}

function viewer (link) {
  console.log('viewer')

  var core = require('hypercore')(require('level')('viewer.db'))
  var feed = core.createFeed(link, {
    sparse: true,
    storage: raf('viewer.data/' + link + '.feed')
  })

  feed.get(0, noop)

  require('hyperdrive-archive-swarm')(feed)

  var s = require('http').createServer(function (req, res) {
    res.setHeader('Content-Type', 'video/webm')
    feed.get(0, function (err, data) {
      if (err) return res.end()
      res.write(data)

      var offset = feed.blocks
      var buf = 4
      while (buf-- && offset) offset--

      feed.prioritize({start: offset, priority: 5, linear: true})
      eos(res, function () {
        feed.unprioritize({start: offset, priority: 5, linear: true})
      })

      feed.get(offset, function loop (err, data) {
        if (err) return res.end()
        res.write(data, function () {
          feed.get(++offset, loop)
        })
      })
    })
  })

  s.listen(0, function () {
    document.body.innerHTML = '<video autoplay controls>'
    $('video').src = 'http://localhost:' + s.address().port + '/video.webm'
  })
}
