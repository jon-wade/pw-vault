var express = require('express');
var login = require('./utils/login.js');
var emailVerification = require('./utils/emailVerification.js');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var mongooseConfig = require('./db/mongoose-config.js');

//web server
var app = express();

//this serves all the static assets
app.use(express.static(__dirname + '/public'));

//TODO: Needs to be unit tested...perhaps by E2E test as login.check has been unit tested
app.post('/login-test', jsonParser, function(req, res) {
    login.check(req.body.username, req.body.password, mongooseConfig.userDev)
        .then(function(success) {
            res.status(200).send(success);
        }, function(error) {
            res.status(404).send(error);
        });
});

//TODO: POST /email-verification needs to be unit tested

app.post('/email-verification', jsonParser, function(req, res) {
    emailVerification.check(req.body.email, mongooseConfig.userDev)
        .then(function(success) {
            res.status(200).send(success);
        }, function(error) {
            res.status(404).send(error);
        });
});

//this sends request for endpoints that don't exist back to angular for routing (as well as dealing with error pages)
app.get('*', function(req, res) {
    res.sendFile('index.html', {root: __dirname + '/public/'});
});

app.listen(8080);
console.log("App is listening on port 8080");

exports.app = app;