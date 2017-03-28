var html = require('choo/html')
var onload = require('on-load')
var css = require('sheetify')

var button = require('./button')
var player = require('./player')

var watch = require('../lib/watch')

var $ = document.getElementById.bind(document)

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

      header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 1rem;
      }

      section {
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

      footer {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 1rem;

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
      ${ player() }
      <div class="overlay" id="overlay">
        <header>
          <section>
            ${ button('grey', 'Fullscreen', fullscreen) }
          </section>
          <section>
            <div style="background:dd rgba(0, 0, 0, 0)">
              <input type="range" value=${ 75 } oninput=${ volumeChange } />
            </div>
          </section>
        </header>
        <footer>
          ${ button('grey', 'Back to menu', mainMenu) }
          <div class="share">
            <span>Share</span>
            <input value=${ state.hash } readonly />
          </div>
        </footer>
      </div>
    </main>
  `

  // attach view lifecycle functions
  onload(div, load)

  // return function to router
  return div

  // play stream on load
  function load () {
    watch.start(state.hash, function (port) {
      $('player').volume = 0.75
      $('player').src = 'http://localhost:' + port + '/video.webm'
    })
  }

  // start jumbo vision
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

  // exit stream & go back to menu
  function mainMenu () {
    $('player').src = ''
    emit('updateHash', '')
    emit('redirect', `/`)
  }
}
