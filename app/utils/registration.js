var db = require('../db/database.js');
var CryptoJS = require('crypto-js');
var secret = require('../utils/secret.js');

exports.create = function(username, password, email, model) {

    return new Promise(function(resolve, reject) {
        //encrypt username - password and email already hashed
        var encryptionKey = secret.key().get_Key();

        var encryptedUsername = CryptoJS.AES.encrypt(username, encryptionKey);

        db.controller.create(
            {
                username: encryptedUsername,
                password: password,
                email: email
            }, model)
            .then(function(res) {
                //successfully saved in the db
                //console.log('registration.js res=', res);
                resolve({
                    successMessage: 'user successfully created',
                    data: res
                });

            }, function(rej) {
                //failure to save in the db
                //console.log('registration.js rej=', rej);
                reject({
                    errorMessage: 'user creation failed',
                    data: rej
                });
            });

    });



};