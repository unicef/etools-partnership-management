var express = require('express');
var app = express();
var basedir = '/code/build/pmp/bundled/';
//var basedir = '/Users/Robi/Desktop/etools/infra/etools-infra/pmp/build/pmp/bundled/';


app.use('/pmp/', express.static(basedir));

app.listen(8080);