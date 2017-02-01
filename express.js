var express = require('express');
var app = express();
var basedir = '/code/build/pmp/bundled/';
var node_modulesDir = '/code/node_modules/';
//var basedir = '/Users/Robi/Desktop/etools/infra/etools-infra/pmp/build/pmp/bundled/';


app.use('/pmp/', express.static(basedir));

app.get(/.*service-worker\.js/, function(req, res) {
  res.sendFile(basedir + 'service-worker.js');
});
app.get(/node_modules/, express.static(node_modulesDir));
app.use(function(req, res) {
  res.sendFile(basedir + 'index.html');
});


app.listen(8080);