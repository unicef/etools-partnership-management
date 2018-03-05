var express = require('express');
var prplServer = require('prpl-server');

var app = express();

app.use('/pmp/', prplServer.makeHandler('build/pmp/', {
    builds: [
        {name: 'es6-bundled', browserCapabilities: ['es2015']},
        {name: 'es5-bundled'}
    ]
}));

app.listen(8080);
