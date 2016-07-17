//mongoose/mongodb set-up
var mongoose = require('mongoose');

var environment = {
    production: "",
    development: "mongodb://localhost:27017/pw-vault-dev",
    //test: "mongodb://localhost:27018/pw-vault-test"
};

var User = mongoose.Schema({
    username: {type: String, minlength: 44, index: {unique: true}, required: true},
    password: {type: String, minlength: 64, required: true},
    email: {type: String, minlength:64, index: {unique: true}, required: true}
});

var Manager = mongoose.Schema({
    userId: {type: String, required: true},
    sitename: {type: String, required: true},
    username: {type: String, minlength: 44, required: true},
    password: {type: String, minlength: 44, required: true}
});

//var test = mongoose.createConnection(environment.test);
//console.log('test=', typeof test);
//console.log('test keys=', Object.keys(test));
var dev = mongoose.createConnection(environment.development);
//console.log('dev=', typeof dev);
//console.log('dev keys=', Object.keys(dev));

//exports.userTest = test.model('testUser', User);
//console.log('userTest=', typeof exports.userTest());
//console.log('userTest keys=', Object.keys(exports.userTest));

exports.userDev = dev.model('devUser', User);
//console.log('userTest=', typeof exports.userDev());
//console.log('userTest keys=', Object.keys(exports.userDev));

//exports.managerTest = test.model('testManager', Manager);

exports.managerDev = dev.model('devManager', Manager);

