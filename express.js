var express = require('express');
var app = express();
var basedir = '/code/build/pmp/bundled/';
//var basedir = '/Users/Robi/Desktop/etools/infra/etools-infra/pmp/build/pmp/bundled/';


app.use('/pmp/', express.static(basedir));


app.use(function(req, res) {
  res.sendFile(basedir + 'index.html');
});


app.listen(8080);