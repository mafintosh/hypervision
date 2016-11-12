var electron = require('electron')
var path = require('path')

var win = null
var app = electron.app
var BrowserWindow = electron.BrowserWindow

app.on('ready', function () {
  console.log('The application is ready.')

  win = new BrowserWindow()
  win.loadURL('file://' + path.join(__dirname, 'index.html'))
  win.on('close', function () {
    win = null
  })
})
