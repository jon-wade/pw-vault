var db = require('../db/database.js');
var usernameVerification = require('../utils/username-verification.js');
var emailVerification = require('../utils/email-verification.js');

exports.go = function(linkId, username, email, password, model) {

    console.log('linkId=', linkId);
    console.log('username=', username);
    console.log('email=', email);
    console.log('password=', password);

    return new Promise(function(resolve, reject) {

        var userCheck, emCheck;

        if(linkId === undefined) {
            reject(rej);
        }
        else {
            usernameVerification.check(username, model).then(function(res) {
                //username exists and should return an object with the _id
                var _id = res._id;
                console.log('usernameVerification _id=', _id);

                //check returned id is the same as the linkId
                if (_id < linkId) {
                    //returned id does not match id from recovery email link
                    reject(rej);
                }
                else if (_id > linkId) {
                    //returned id does not match id from recovery email link
                    reject(rej);
                }
                else {
                    //usernameVerification is complete
                    userCheck = true;
                    checkComplete(_id);
                }
            }, function(rej) {
                //username does not exist in the db
                reject(rej);
            });

            emailVerification.check(email, model).then(function(res) {
                //email exists and should return an object with the _id
                var _id = res._id;
                console.log('emailVerification _id=', _id);

                //check returned id is the same as the linkId
                if (_id < linkId) {
                    //returned id does not match id from recovery email link
                    reject('the _ids for the email do not match the linkId and we cannot update the password...');
                }
                else if (_id > linkId) {
                    //returned id does not match id from recovery email link
                    reject('the _ids for the email do not match the linkId and we cannot update the password...');
                }
                else {
                    //emailVerification is complete
                    emCheck = true;
                    checkComplete(_id);
                }
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
        }
    });

};