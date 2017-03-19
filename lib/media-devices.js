module.exports = {
  // get list of media inputs connected to computer
  get: function (done) {
    navigator.mediaDevices.enumerateDevices()
    .then(function (devices) {
      done(null, devices)
    })
    .catch(function (err) {
      done(err)
    })
  }
}
