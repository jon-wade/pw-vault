var db = require('../db/database.js');
var usernameVerification = require('../utils/username-verification.js');
var emailVerification = require('../utils/email-verification.js');

exports.go = function(username, email, password, model) {

    //console.log('username=', username);
    //console.log('email=', email);
    //console.log('password=', password);

    return new Promise(function(resolve, reject) {

        var userCheck, emCheck;

        usernameVerification.check(username, model).then(function(res) {
            //username exists and should return an object with the _id
            var _id = res._id;
            //console.log('usernameVerification _id=', _id);
            //usernameVerification is complete
            userCheck = true;
            checkComplete(_id);

        }, function(rej) {
            //username does not exist in the db
            reject(rej);
        });

        emailVerification.check(email, model).then(function(res) {
            //email exists and should return an object with the _id
            var _id = res._id;
            //console.log('emailVerification _id=', _id);
            //emailVerification is complete
            emCheck = true;
            checkComplete(_id);
        }, function(rej) {
            //email address does not exist in the db
            reject(rej);
        });

        var currentId;
        var checkComplete = function(_id) {
            //console.log('currentId=', currentId);
            //console.log('_id=', _id);

            if (userCheck && emCheck) {
                //compare the two _ids
                //console.log('Comparing ids...');

                if (currentId < _id) {
                    //the two _ids do not match
                    reject('the _ids for the username and email do not match and we cannot update the password...')
                }
                else if (currentId > _id) {
                    //the two _ids do not match
                    reject('the _ids for the username and email do not match and we cannot update the password...')
                }
                else {
                    db.controller.update({_id: _id}, {password: password}, model).then(function(res) {
                        //successful database update
                        //console.log('res from db=', res);
                        resolve({
                            successMessage: 'all is well, we have updated the new password in the db...',
                            data: res
                        });
                    }, function(rej) {
                        reject({
                            errorMessage: 'there was a problem updating the database with the new password...',
                            data: rej
                        });
                    });
                }
            }
            else {
                currentId = _id;
            }
        };
    });

};