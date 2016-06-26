//mongoose/mongodb set-up
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pw-vault');

var pUser = mongoose.Schema({
    //TODO : insert schema here
    'username': {type: String, minlength: 64, unique: true},
    'password': {type: String, 'minlength': 64}
});

exports.pUser = mongoose.model('production-user', pUser);

var tUser = mongoose.Schema({
    'username': {type: String, minlength: 64, unique: true},
    'password': {type: String, 'minlength': 64}
});

exports.tUser = mongoose.model('test-user', tUser);
