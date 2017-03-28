var fs = require('fs')
var path = require('path')

var browserify = require('browserify')

// output file
var ws = fs.createWriteStream('bundle.js')

// browserify options (mostly to work with Electron)
var opts = {
  entries: './index.js',
  insertGlobals: true,
  ignoreMissing: true,
  builtins: false,
  browserField: false,
  insertGlobalVars: {
    '__dirname': (file, basedir) => {
      return '__dirname + "/" + ' +
        JSON.stringify(path.dirname(path.relative(basedir, file)))
    },
    '__filename': (file, basedir) => {
      return '__dirname + "/" + ' +
        JSON.stringify(path.relative(basedir, file))
    },
    'process': undefined,
    'global': undefined,
    'Buffer': undefined,
    'Buffer.isBuffer': undefined
  }
}

browserify(opts)
  .transform('sheetify/transform', { use: [ 'sheetify-nested' ] })
  .bundle()
  .pipe(ws)
