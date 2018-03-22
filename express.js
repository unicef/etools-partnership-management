var express = require('express');
var browserCapabilities = require('browser-capabilities');

var app = express();
var basedir = __dirname + '/build/pmp/';
var serveFromDir = basedir + 'es6-bundled/';
//var basedir = '/Users/rob/Desktop/etools/etools-infra/pmp/build/pmp/bundled/';
// var node_modulesReduxDir = __dirname + '/node_modules/redux/dist/';
//var node_modulesReduxDir = '/Users/rob/Desktop/etools/etools-infra/pmp/node_modules/redux/dist/';

app.use((request, response, next) => {
    let clientCapabilities = browserCapabilities.browserCapabilities(
      request.headers['user-agent']);

    clientCapabilities = new Set(clientCapabilities);

    if (clientCapabilities.has("es2015")) {
      request.es6Capable = true;
    } else {
      request.es6Capable = false;
    }
    next();
  });

app.use('/pmp/', (req, res, next) => {
    if (!req.es6Capable) {
      express.static('build/pmp/es5-bundled')(req, res, next)
    } else {
      express.static('build/pmp/es6-bundled')(req, res, next);
    }
  });

// app.get(/.*service-worker\.js/, function(req, res) {
//   res.sendFile(basedir + 'service-worker.js');
// });

// app.get(/.*redux\.min\.js/, function(req, res) {
//   res.sendFile(node_modulesReduxDir + 'redux.min.js');
// });

app.use(function(req, res) {
  // static file requrests that end up here are missing so they should return 404
  if (req.originalUrl.startsWith('/pmp/pmp/')) {
    res.status(404).send('Not found');
  } else {
    // handles requests that look like /pmp/interventions/details
    res.sendFile(serveFromDir + 'index.html');
  }
});


app.listen(8080);
