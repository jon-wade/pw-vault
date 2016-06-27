//mongoose/mongodb set-up
var mongoose = require('mongoose');

exports.environment = {
    production: "",
    development: "mongodb://localhost:27017/pw-vault-dev",
    test: "mongodb://localhost:27018/pw-vault-test"
};

var User = mongoose.Schema({
    username: {type: String, minlength: 64, unique: true, required: true},
    password: {type: String, minlength: 64, required: true},
    email: {type: String, minlength:64, unique: true, required: true}
});

exports.user = mongoose.model('user', User);

