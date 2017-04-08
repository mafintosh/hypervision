var http = require('http')
var hypercore = require('hypercore')
var hyperdiscovery = require('hyperdiscovery')
var eos = require('end-of-stream')

module.exports = {
  start: start
}

function start (hash, cb) {
  // create feed from stream hash
  var feed = hypercore(`./streams/viewed/${ Date.now ()}`, hash, {
    sparse: true
  })

  // when feed is ready, start watching the stream
  feed.on('ready', function () {
    feed.get(0, function () {})

    // join p2p swarm
    var swarm = hyperdiscovery(feed, {live: true})

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
      var port = server.address().port
      cb(port)
    })
  })
}

