var html = require('choo/html')
var onload = require('on-load')

var eos = require('end-of-stream')
var raf = require('random-access-file')
var viewer = require('hypercore')(require('level')('viewer.db'))

var $ = document.getElementById.bind(document)

var stream, feed, swarm, server

function noop () {}

module.exports = function (state, prev, send) {
  var div = html`
    <main onmouseover=${ hoverEnter } onmouseout=${ hoverLeave }>
      <div class="preview">
        <video class="preview-video" id="player" autoplay></video>
      </div>
      <div class="overlay" id="overlay">
        <div class="header">
          <div class="header-section">
            <div class="header-fullscreen" style="background-color: ${ status.live ? '#F9364E' : '#d0d0d0' }" onclick=${ fullscreen }>
              Fullscreen
            </div>
          </div>

          <div class="header-section">
            <div class="header-input" style="background: rgba(0, 0, 0, 0)">
              <input type="range" value=${ 75 } oninput=${ volumeChange } />
            </div>
          </div>
        </div>

        <div class="footer">
          <a href="/" class="footer-button">Back to menu</div>
          <div class="footer-share">
            <span class="footer-share-label">Share</span>
            <input class="footer-share-input" value=${ state.location.search.stream } readonly />
          </div>
        </div>
      </div>
    </main>
  `

  // attach view lifecycle functions
  onload(div, load, unload)

  // return function to router
  return div

  // when view finishes loading
  function load () {
    stream = state.location.search.stream

    // create feed from stream hash
    feed = viewer.createFeed(stream, {
      sparse: true,
      storage: raf('viewer.data/' + stream + '.feed')
    })

    feed.get(0, noop)

    // join p2p swarm
    swarm = require('hyperdrive-archive-swarm')(feed)

    // create an http server to deliver video to user
    server = require('http').createServer(function (req, res) {
      res.setHeader('Content-Type', 'video/webm')
      feed.get(0, function (err, data) {
        if (err) return res.end()
        res.write(data)

        var offset = feed.blocks
        var buf = 4
        while (buf-- && offset > 1) offset--

        var start = offset

        feed.prioritize({start: start, priority: 5, linear: true})
        eos(res, function () {
          feed.unprioritize({start: start, priority: 5, linear: true})
        })

        feed.get(offset, function loop (err, data) {
          if (err) return res.end()
          res.write(data, function () {
            feed.get(++offset, loop)
          })
        })
      })
    })

    // tune player into stream
    window.server.listen(0, function () {
      $('player').volume = 0.75
      $('player').src = 'http://localhost:' + server.address().port + '/video.webm'
    })
  }

  // when view finishes unloading
  function unload () {
    // do something
  }

  // go jumbo vision
  function fullscreen () {
    $('player').webkitRequestFullscreen()
  }

  // when user's mouse enters window
  function hoverEnter () {
    $('overlay').style = "opacity: 1"
  }

  // when user's mouse leaves window
  function hoverLeave () {
    $('overlay').style = "opacity: 0"
  }

  // when user changes volume
  function volumeChange (e) {
    $('player').volume = e.target.value / 100
  }
}
