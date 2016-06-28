//mongoose/mongodb set-up

//TODO: Needs to be unit tested
var mongoose = require('mongoose');

var environment = {
    production: "",
    development: "mongodb://localhost:27017/pw-vault-dev",
    test: "mongodb://localhost:27018/pw-vault-test"
};

var User = mongoose.Schema({
    username: {type: String, minlength: 44, unique: true, required: true},
    password: {type: String, minlength: 64, required: true},
    email: {type: String, minlength:64, unique: true, required: true}
});

var test = mongoose.createConnection(environment.test);
var dev = mongoose.createConnection(environment.development);

exports.userTest = test.model('testUser', User);
exports.userDev = dev.model('devUser', User);

