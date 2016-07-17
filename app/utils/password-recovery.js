var db = require('../db/database.js');
var mailer = require('../utils/mailer.js');
var CryptoJS = require('crypto-js');

exports.go = function(id, email, model) {
    return new Promise(function(resolve, reject) {

        //retrieve email from db and compare to the email submitted
        //console.log('id=', id);
        //console.log('email=', email);
        //console.log('model=', model);

        //first hash the submitted email
        var hashedemail = CryptoJS.SHA256(email).toString(CryptoJS.enc.Hex);
        //
        //console.log('hashedemail=', hashedemail);

        db.controller.read({_id: id}, 'email', model).then(function(res) {
            //check if there are any results in the array
            if(res.length !==0) {

                //console.log('res=', res);

                //check if hashedemail and email field are the same
                if(hashedemail === res[0].email) {
                    //there is a match, send a password recovery link to the registered email address
                    mailer.send(email, 'Password Vault Password Recovery', 'Hi there - you recently requested to reset your password. Please click this link to start the password reset process: http://pv.uk/change-password?id=' + id + '. Best, Password Vault')
                        .then(function(res) {
                            //successful mailing
                            resolve({
                                successMessage: 'Password recovery link has been successfully dispatched by the mailer program',
                                data: res
                            });

                        }, function(rej) {
                            //unsuccessful mailing
                            reject({
                                errorMessage: 'Error in mailing program, password link not sent.',
                                data: rej
                            });
                        });
                }
                else {
                    //the email submitted does not match the email stored on file
                    reject({
                        errorMessage: 'Email address and _id do not match.'
                    });
                }
            }
            else {
                //no results in the array
                reject({
                    errorMessage: 'No results found for that _id.'
                });
            }
        }, function(rej) {
            //error reading the database
            reject({
                errorMessage: 'Error reading database',
                data: rej
            });

        });

    });
}