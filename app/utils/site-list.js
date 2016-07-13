var db = require('../db/database.js');

exports.go = function(userId, model) {
    return new Promise(function(resolve, reject) {

        db.controller.read({userId: userId}, 'sitename', model).then(function(res) {

            //check if there are any results
            if(res.length !==0) {
                //success
                resolve({
                    successMessage: 'success, array attached...',
                    data: res
                });
            }
            else {
                //empty array returned here, no error thrown...
                reject({
                    errorMessage: 'No records found that matches userId',
                    data: res
                });
            }
        }, function(rej) {
            //userId cannot be found in database, error thrown
            reject({
                errorMessage: 'No records found that matches userId',
                data: rej
            });

        });

    });

};
