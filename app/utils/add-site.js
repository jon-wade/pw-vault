var db = require('../db/database.js');

exports.go = function(userId, sitename, username, password,  model) {

    //all entries should already be encrypted

    return new Promise(function(resolve, reject) {

        db.controller.create(
            {
                userId: userId,
                sitename: sitename,
                username: username,
                password: password
            }, model

        ).then(function(res) {
            //successfully saved in the db
            resolve({
                successMessage: 'record successfully created',
                data: res
            });

        }, function(rej) {
            //failure to save in the db

            reject({
                errorMessage: 'record creation failed',
                data: rej
            });
        });
    });
};