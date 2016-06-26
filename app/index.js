var express = require('express');
var db = require('./db/database.js');
var mongoose = require('./db/mongoose-config.js');

//db loading experiment

db.controller.delete({
    'username': 'e51f18e34de728dcc0cb077b8df6db10fca7abd4e0bbb09324047883f48b0e01',
    'password': 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae'
}, mongoose.user)
    .then(function(){
        db.controller.create({
            'username': 'e51f18e34de728dcc0cb077b8df6db10fca7abd4e0bbb09324047883f48b0e01',
            'password': 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae'
        }, mongoose.user);
    });

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