var express = require('express')
var app = express()
var path = require('path');

app.get('/', function (req, res) {
  res.send('Please navigate to /pmp')
})

app.get('/pmp', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/api/partners', function(req, res) {
    res.sendFile(path.join(__dirname + '/data/partners.json'));
});
app.get('/api/countries', function(req, res) {
    res.sendFile(path.join(__dirname + '/data/countries.json'));
});

app.use('/pmp/pmp', express.static('pmp'));
app.use('/pmp/bower_components', express.static('bower_components'));
app.use('/pmp/images', express.static('images'));
app.use('/pmp/scripts', express.static('scripts'));
app.use('/pmp/styles', express.static('styles'));



app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})