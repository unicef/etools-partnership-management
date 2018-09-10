var express = require('express'); // eslint-disable-line
var browserCapabilities = require('browser-capabilities'); // eslint-disable-line

const app = express();
const basedir = __dirname + '/build/pmp/'; // eslint-disable-line

function getSourcesPath(request) {
  let clientCapabilities = browserCapabilities.browserCapabilities(
      request.headers['user-agent']);

  clientCapabilities = new Set(clientCapabilities); // eslint-disable-line
  if (clientCapabilities.has('es2015')) {
    return basedir + 'es6-bundled/';
  } else {
    return basedir + 'es5-bundled/';
  }
}

app.use('/pmp/', (req, res, next) => {
  // console.log('pmp ==============================================', req.originalUrl, req.url);
  req.url = req.originalUrl;
  express.static(getSourcesPath(req))(req, res, next);
});

app.get(/.*service-worker\.js/, function(req, res) {
  res.sendFile(getSourcesPath(req) + 'service-worker.js');
});

// TODO: check if this holds true in Polymer 2
app.use(function(req, res, next) {
  // static file requests that end up here are missing so they should return 404
  if (req.originalUrl.startsWith('/pmp/pmp/')) {
    res.status(404).send('Not found');
  } else if (req.originalUrl.startsWith('/images/')) {
    express.static(getSourcesPath(req))(req, res, next);
  } else {
    // handles requests that look like /pmp/interventions/details
    res.sendFile(getSourcesPath(req) + 'index.html');
  }
});

app.listen(8080);
