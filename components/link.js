var html = require('choo/html')
var css = require('sheetify')

module.exports = link

function link (color, text, location) {
  var style = css`
    :host {
      border: none;
      color: #FFFFFF;
      padding: 0.5rem 0.6rem 0.45rem 0.6rem;
      font-size: 18px;
      border-radius: 2px;
      text-decoration: none;
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      cursor: default;
    }
  `

  return html`
    <a class=${ style } style=${ bgColor() } href=${ location }>
      ${ text }
    </a>
  `

  function bgColor () {
    return `background: var(--color-${ color });`
  }
}
