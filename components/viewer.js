var html = require('choo/html')
var onload = require('on-load')
var css = require('sheetify')

var http = require('http')
var hypercore = require('hypercore')
var hyperdiscovery = require('hyperdiscovery')
var eos = require('end-of-stream')

var $ = document.getElementById.bind(document)

function noop () {}

module.exports = function (state, emit) {
  var style = css`
    :host {
      .preview { width: 100%; }
      video { width: 100%; }

      .overlay {
        position: fixed;
        height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: rgba(256, 256, 256, 0.3);
        transition: opacity 0.5s
      }

      .header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 1rem;
      }

      .section {
        display: flex;
        flex-direction: row;
      }

      .fullscreen {
        color: white;

        text-align: center;
        width: 5.5rem;
        border-radius: 2px;
        padding: 0.5rem 0.65rem 0.5rem 0.6rem;
        margin: 0 1rem 0 0;
      }

      input[type=range] {
        -webkit-appearance: none;
      }

      input[type=range]:focus {
        outline: none;
      }

      input[type=range]::-webkit-slider-runnable-track {
        width: 100%;
        height: 5px;
        cursor: pointer;
        background: pink;
        border-radius: 1.3px;
      }

      input[type=range]::-webkit-slider-thumb {
        height: 15px;
        width: 15px;
        border-radius: 15px;
        background: #ffffff;
        cursor: pointer;
        -webkit-appearance: none;
        margin-top: -5.5px;
      }

      .footer {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 1rem;

        .button {
          background: var(--color-grey);
          color: white;
          border-radius: 2px;
          padding: 0.5rem 0.65rem 0.5rem 0.6rem;
          text-decoration: none;
        }

        .share {
          display: flex;
          flex-direction: row;
          align-items: center;

          span {
            padding: 0 1rem 0 0;
          }

          input {
            font-size: 16px;
            padding: 0.4rem 0 0.4rem 0.65rem;
            width: 14rem;
            border: none;
            border-radius: 2px;
          }
        }
      }
    }
  `
  var div = html`
    <main class=${ style } onmouseover=${ hoverEnter } onmouseout=${ hoverLeave }>
      <div class="preview">
        <video id="player" autoplay></video>
      </div>
      <div class="overlay" id="overlay">
        <div class="header">
          <div class="section">
            <div class="fullscreen" style="background-color: ${ status.live ? '#F9364E' : '#d0d0d0' }" onclick=${ fullscreen }>
              Fullscreen
            </div>
          </div>

          <div class="section">
            <div style="background: rgba(0, 0, 0, 0)">
              <input type="range" value=${ 75 } oninput=${ volumeChange } />
            </div>
          </div>
        </div>

        <div class="footer">
          <div class="button" onclick=${ mainMenu }>Back to menu</div>
          <div class="share">
            <span>Share</span>
            <input value=${ state.watching } readonly />
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
    var stream = state.watch

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
