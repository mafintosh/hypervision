var html = require('choo/html')
var css = require('sheetify')

var link= require('./link')
var input = require('./input')

var style = css`
  :host {
    background: var(--color-off-white);
    text-align: center;

    .title {
      font-size: 24px;
      margin-bottom: 3rem;
      letter-spacing: 0;
    }

    .watch { margin-bottom: 1.5rem; }
    .label { margin-bottom: 0.5rem; }
  }
`

module.exports = function (state, emit) {
  return html`
    <main class=${ style }>
      <div class="title">
        <div>hypervision</div>
        <div>p2p live streaming</div>
      </div>

      <div class="watch">
        <div class="label">Watch stream</div>
        ${ input(state.hash, watch) }
      </div>

      <div class="broadcast">
        <div class="label">Start broadcasting</div>
        ${ link('pink', 'Go live', '/broadcast') }
      </div>
    </main>
  `

  // check for valid hash, then open stream
  function watch (e) {
    emit('watch', e.target.value)
  }
}
