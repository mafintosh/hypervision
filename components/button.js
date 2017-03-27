var html = require('choo/html')
var css = require('sheetify')

module.exports = button

function button (color, text, onclick) {
  var style = css`
    :host {
      background: var(--color-pink);
      border: none;
      color: #FFFFFF;
      padding: 0.35rem 0.6rem;
      font-size: 18px;
      border-radius: 2px;
      text-decoration: none;
      cursor: pointer;
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }
  `

  return html`
    <div class=${ style } onclick=${ onclick }>
      ${ text }
    </div>
  `
}
