var db = require('../db/database.js');
var mailer = require('../utils/mailer.js');
var CryptoJS = require('crypto-js');
var secret = require('../utils/secret.js');

exports.go = function(id, email, model) {
    return new Promise(function(resolve, reject) {

        //console.log('id=', id, 'email=', email);
        //first, look up the id in the correct db
        db.controller.read({_id: id}, 'username', model).then(function(res) {
            //console.log('db res=', res);

            //check if there are any results
            if(res.length !==0) {
                //then once you have the username that matches that _id, save it
                var ciphertext = res[0].username;

                //get the encryption key
                var encryptionKey = secret.key().get_Key();

                //decrypt it
                var bytes  = CryptoJS.AES.decrypt(ciphertext.toString(), encryptionKey);
                var plaintext = bytes.toString(CryptoJS.enc.Utf8);

                //send it to the mailer program along with the message!!
                mailer.send(email, 'Password Vault Username Recovery', 'Hi there - you recently requested to be reminded of your Password Vault username. Your username is: ' + plaintext + '. Please logon using this username for access to your Password Manager. Best, Password Vault.')
                    .then(function(res) {
                        //successful mailing
                        //console.log('mailing response=', res);
                        resolve({
                            successMessage: 'Username has been successfully dispatched by the mailer program.'
                        });
                    }, function(rej) {
                        //unsuccessful mailing
                        //console.log('mailing error=', rej);
                        reject({
                            errorMessage: 'Error in mailing program, username details not sent.'
                        });
                    });
            }
            else {
                //empty array returned here, no error thrown...
                reject({
                    errorMessage: 'No username found that matches _id' + id + '.'
                });

            }

        }, function(err) {
            //_id cannot be found in database, error thrown
            reject({
                errorMessage: 'No username found that matches _id' + id + '.'
            });
        });

    });


};
