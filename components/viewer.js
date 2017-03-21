var html = require('choo/html')
var onload = require('on-load')

var http = require('http')
var hypercore = require('hypercore')
var hyperdiscovery = require('hyperdiscovery')
var eos = require('end-of-stream')

var $ = document.getElementById.bind(document)

function noop () {}

module.exports = function (state, emit) {
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
          <div class="footer-button" onclick=${ mainMenu }>Back to menu</div>
          <div class="footer-share">
            <span class="footer-share-label">Share</span>
            <input class="footer-share-input" value=${ state.location.search.stream } readonly />
          </div>
        </div>
      </div>
    </main>
  `

  // attach view lifecycle functions
  onload(div, load)

  // return function to router
  return div

  // when view finishes loading
  function load () {
    var stream = state.location.search.stream

    // create feed from stream hash
    var feed = hypercore(`./streams/viewed/${ Date.now ()}`, stream, {
      sparse: true
    })

    // when feed is ready, start watching the stream
    feed.on('ready', function () {
      feed.get(0, noop)

      // join p2p swarm
      var swarm = hyperdiscovery(feed)

      // create an http server to deliver video to user
      var server = http.createServer(function (req, res) {
        res.setHeader('Content-Type', 'video/webm')
        feed.get(0, function (err, data) {
          if (err) return res.end()
          res.write(data)

          var offset = feed.length
          var buf = 4
          while (buf-- && offset > 1) offset--

          var start = offset

          // start downloading data
          feed.download({start: start, linear: true})

          // when user stops watching stream, close everything down
          eos(res, function () {
            feed.undownload({start: start, linear: true})
            server.close()
            swarm.close()
            feed.close(function (err) { if (err) console.log('err: ', err) })
          })

          // keep piping new data from feed to response stream
          feed.get(offset, function loop (err, data) {
            if (err) return res.end()
            res.write(data, function () {
              feed.get(++offset, loop)
            })
          })
        })
      })

      // tune player into stream
      server.listen(0, function () {
        $('player').volume = 0.75
        $('player').src = 'http://localhost:' + server.address().port + '/video.webm'
      })
    })
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

  // exit stream and go back to menu
  function mainMenu () {
    $('player').src = ''
    emit('location:set', `/`)
  }
}
