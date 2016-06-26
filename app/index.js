var express = require('express');
var db = require('./db/database.js');
var mongoose = require('./db/mongoose-config.js');

//web server
var app = express();

//this serves all the static assets
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile('/public/index.html');
});

app.get('/login', function(req, res) {
    //TODO: send back the database response object
});

//the following block needs to be at the bottom and handles routing for any pages
//that don't exist - the browser is sent back the home page, index.html, in that case
app.get('/*', function(req, res) {
    res.sendFile('index.html', {root: __dirname + '/public/'});
});

app.listen(8080);
console.log("App is listening on port 8080");

exports.app = app;