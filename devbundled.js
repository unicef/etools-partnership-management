var express = require('express')
var app = express()
var path = require('path');

app.get('/', function (req, res) {
  res.send('Please navigate to /pmp')
})

app.get('/api/partners', function(req, res) {
    res.sendFile(path.join(__dirname + '/data/partners.json'));
});
app.get('/api/countries', function(req, res) {
    res.sendFile(path.join(__dirname + '/data/countries.json'));
});

app.use('/pmp', express.static('build/bundled'));



app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})