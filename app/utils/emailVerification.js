var db = require('../db/database.js');
var CryptoJS = require('crypto-js');


exports.check = function (email, model) {
    return new Promise(function(resolve, reject) {

        //var hashedEmail = CryptoJS.SHA256(email).toString();

        db.controller.read({email: email}, '_id', model).then(function(res) {
            if(res.length === 0) {
                //no registered email address matches in the database
                reject({
                    errorMessage: 'Not a registered email address.'
                });
            }
            else {
                resolve({
                    successMessage: 'Registered email address'
                });
            }
        });
    });
};



