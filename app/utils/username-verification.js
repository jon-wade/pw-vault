var db = require('../db/database.js');
var CryptoJS = require('crypto-js');
var secret = require('./secret.js');

exports.check = function (username, model) {
    return new Promise(function(resolve, reject) {
        //get encryption key
        var encryptionKey = secret.key().get_Key();

        //console.log('encryptionKey', encryptionKey);

        //decrypt username stored in db
        var decrypt = function(ciphertext) {
            var bytes  = CryptoJS.AES.decrypt(ciphertext.toString(), encryptionKey);
            return bytes.toString(CryptoJS.enc.Utf8);
        };

        db.controller.read({}, 'username', model)
            .then(function(res) {
                //console.log('db res=', res);
                var result = res.filter(function(item) {
                    return decrypt(item.username) === username;
                });
                if(result.length === 0) {
                    //no registered username in the database
                    reject({
                        errorMessage: 'Not a registered username'
                    });
                }
                else {
                    resolve({
                        successMessage: 'Registered username',
                        _id: res[0]._id
                    });
                }
            });
    });
};