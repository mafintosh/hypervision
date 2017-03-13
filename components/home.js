var html = require('choo/html')

module.exports = function (state, prev, send) {
  return html`
    <main class="home">
      <div class="home-title">
        <div>hypervision</div>
        <div>p2p livestreaming</div>
      </div>

      <div class="home-watch">
        <div class="home-watch-label">
          Watch stream
        </div>
        <input class="home-watch-input" oninput=${ inputUpdate } />
      </div>

      <div class="home-broadcast">
        <div class="home-broadcast-label">
          Start broadcasting
        </div>
        <a href="/broadcast" class="home-broadcast-button">
          Go live
        </a>
      </div>
    </main>
  `

  // check validity of hash before opening viewer
  function inputUpdate (e) {
    if (e.target.value.length === 64) {
      send('location:set', `/view?stream=${ e.target.value }`)
    }
  }
}
