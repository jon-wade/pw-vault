//mongoose/mongodb set-up
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pw-vault');

var user = mongoose.Schema({
    //TODO : insert schema here
    'username': {type: String, minlength: 64, unique: true},
    'password': {type: String, 'minlength': 64}
});

exports.user = mongoose.model('user', user);
