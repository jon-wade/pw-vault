var db = require('../db/database.js');
var CryptoJS = require('crypto-js');
var secret = require('./secret.js');

exports.check = function(username, password, model) {

    return new Promise(function(resolve, reject) {
        //get encryption key
        var encryptionKey = secret.key().get_Key();

        //decrypt username stored in db
        var decrypt = function(ciphertext) {
            var bytes  = CryptoJS.AES.decrypt(ciphertext.toString(), encryptionKey);
            return bytes.toString(CryptoJS.enc.Utf8);
        };

        db.controller.read({}, '_id username password', model).then(function(res) {
            var result = res.filter(function(item) {
                return (decrypt(item.username) === username) && (item.password === password);
            });
            if(result.length === 0) {
                //no user that matches that username and password combination
                reject({
                    errorMessage: 'Username and password combination do not match existing user.'
                });
            }
            else {
                resolve({'_id': result[0]._id});
            }
        });
    });

};
