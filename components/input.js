var html = require('choo/html')
var css = require('sheetify')

module.exports = button

function button (value, oninput) {
  var style = css`
    :host {
      font-size: 16px;
      padding: 0.4rem 0 0.4rem 0.65rem;
      width: 14rem;
      border: none;
      border-radius: 2px;
      font-weight: 500;
    }
  `

  return html`<input class=${ style } value=${ value } oninput=${ oninput } />`
}
