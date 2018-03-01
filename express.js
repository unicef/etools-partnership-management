var express = require('express');
var prplServer = require('prpl-server');

var app = express();
var basedir = __dirname + '/build/';
var serveFromDir = basedir + 'es6-bundled/';
//var basedir = '/Users/rob/Desktop/etools/etools-infra/pmp/build/pmp/bundled/';
// var node_modulesReduxDir = __dirname + '/node_modules/redux/dist/';
// var node_modulesReduxDir = '/Users/rob/Desktop/etools/etools-infra/pmp/node_modules/redux/dist/';

 app.use('/pmp/', prplServer.makeHandler('build/pmp/', {
  builds: [
    {name: 'es6-bundled', browserCapabilities: ['es2015']},
    {name: 'es5-bundled'}
  ],
}));

// app.get(/.*service-worker\.js/, function(req, res) {
//   res.sendFile(basedir + 'service-worker.js');
// });

// app.get(/.*redux\.min\.js/, function(req, res) {
//   res.sendFile(node_modulesReduxDir + 'redux.min.js');
// });

// app.use(function(req, res) {
//   // static file requrests that end up here are missing so they should return 404
//   if (req.originalUrl.startsWith('/pmp/pmp/')) {
//     res.status(404).send('Not found');
//   } else {
//     console.log('build', serveFromDir);
//     // handles requests that look like /pmp/interventions/details
//     res.sendFile(serveFromDir + 'index.html');
//   }
// });


app.listen(8080);
