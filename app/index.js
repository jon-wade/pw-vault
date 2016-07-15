var express = require('express');
var bodyParser = require('body-parser');

var mongooseConfig = require('./db/mongoose-config.js');


var login = require('./utils/login.js');
var emailVerification = require('./utils/email-verification.js');
var usernameRecovery = require('./utils/username-recovery.js');
var usernameVerification = require('./utils/username-verification.js');
var registration = require('./utils/registration.js');
var passwordUpdate = require('./utils/password-update.js');
var addSite = require('./utils/add-site.js');
var siteList = require('./utils/site-list.js');
var retrieveSite = require('./utils/retrieve-site.js');
var deleteSite = require('./utils/delete-site.js');
var editSite = require('./utils/edit-site.js');

var jsonParser = bodyParser.json();

//web server
var app = express();

//this serves all the static assets
app.use(express.static(__dirname + '/public'));

app.post('/login-test', jsonParser, function(req, res) {
    login.check(req.body.username, req.body.password, mongooseConfig.userDev)
        .then(function(success) {
            res.status(200).send(success);
        }, function(error) {
            res.status(404).send(error);
        });
});

app.post('/email-verification', jsonParser, function(req, res) {
    emailVerification.check(req.body.email, mongooseConfig.userDev)
        .then(function(success) {
            res.status(200).send(success);
        }, function(error) {
            res.status(404).send(error);
        });
});

app.post('/username-verification', jsonParser, function(req, res) {
    usernameVerification.check(req.body.username, mongooseConfig.userDev)
        .then(function(success) {
            res.status(200).send(success);
        }, function(error) {
            res.status(404).send(error);
        });
});

app.post('/username-recovery', jsonParser, function(req, res) {
    usernameRecovery.go(req.body._id, req.body.email, mongooseConfig.userDev)
        .then(function(success) {
            //console.log('success=', success);
            res.status(200).send(success);
        }, function(error) {
            //console.log('error=', error);
            res.status(404).send(error);
        });
});

app.post('/create', jsonParser, function(req, res) {
    registration.create(req.body.username, req.body.password, req.body.email, mongooseConfig.userDev)
        .then(function(success) {
            //console.log('success.data._id=', success.data._id);
            res.status(200).send(success.data._id);
        }, function(error) {
            //console.log('error=', error);
            res.status(404).send(error);
        });
});

app.post('/update-password', jsonParser, function(req, res) {
    passwordUpdate.go(req.body.username, req.body.email, req.body.password, mongooseConfig.userDev).then(function(success) {
        //console.log('success=', success);
        res.status(200).send(success.data._id);
    }, function(error) {
        //console.log('error=', error);
        res.status(404).send(error);

    });
});

app.post('/add-site', jsonParser, function(req, res) {
    addSite.go(req.body.userId, req.body.sitename, req.body.username, req.body.password, mongooseConfig.managerDev).then(function(success) {
        //console.log('success=', success);
        res.status(200).send(success);
    }, function(error) {
        //console.log('error=', error);
        res.status(404).send(error);
    });
});

app.post('/site-list', jsonParser, function(req, res) {
    siteList.go(req.body.userId, mongooseConfig.managerDev)
        .then(function(success) {
            res.status(200).send(success);
        }, function(error) {
            res.status(404).send(error);
        });
});

app.post('/retrieve-site', jsonParser, function(req, res) {
    retrieveSite.go(req.body.userId, req.body.managerId, mongooseConfig.managerDev)
        .then(function(success) {
            res.status(200).send(success);
        }, function(error) {
            res.status(404).send(error);
        });
});

app.post('/delete-site', jsonParser, function(req, res) {
    deleteSite.go(req.body.managerId, mongooseConfig.managerDev)
        .then(function(success) {
            res.status(200).send(success);
        }, function(error) {
            res.status(404).send(error);
        });
});

app.post('/edit-site', jsonParser, function(req, res) {
    editSite.go(req.body._id, req.body.username, req.body.password, mongooseConfig.managerDev)
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

//this if statement ensures that the app.listen() method is only spun up on calls from the CLI node index.js, not from a test suite
if(!module.parent) {
    app.listen(8080);
    console.log("App is listening on port 8080");
}

exports.app = app;