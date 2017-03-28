var html = require('choo/html')
var css = require('sheetify')

module.exports = function (state, emit) {
  var style = css`
    :host {
      width: 100%;
      video { width: 100%; }
    }
  `

  var el = html`
    <div class=${ style }>
      <video id="player" autoplay></video>
    </div>
  `

  return el
}
