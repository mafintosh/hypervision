var html = require('choo/html')
var css = require('sheetify')

var button = require('./button')
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
        ${ input(state.watch, watchStream) }
      </div>

      <div class="broadcast">
        <div class="label">Start broadcasting</div>
        ${ button('pink', 'Go live', startBroadcast) }
      </div>
    </main>
  `

  // check for valid hash, then open stream
  function watchStream (e) {
    emit('watch', e.target.value)

    if (state.watch.length === 64) {
      emit('redirect', `/view?stream=${ e.target.value }`)
    }
  }

  // open broadcast screen
  function startBroadcast () {
    emit('redirect', '/broadcast')
  }
}
