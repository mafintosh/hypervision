var electron = require('electron')
var path = require('path')

var win = null
var app = electron.app
var BrowserWindow = electron.BrowserWindow

app.on('ready', function () {
  console.log('The application is ready.')

  win = new BrowserWindow({
    width: 854,
    height: 650,
    minWidth: 550,
    minHeight: 200
  })

  win.loadURL('file://' + path.join(__dirname, 'index.html'))
  win.on('close', function () {
    win = null
  })
})
