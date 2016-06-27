var express = require('express');
var mongoose = require('mongoose');
var db = require('./db/database.js');
var mongooseConfig = require('./db/mongoose-config.js');

//clean the dev database
db.controller.delete({}, mongooseConfig.userDev);

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