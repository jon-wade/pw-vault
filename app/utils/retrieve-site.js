var db = require('../db/database.js');

exports.go = function(userId, managerId, model) {

    return new Promise(function(resolve, reject) {

        db.controller.read({userId: userId, _id: managerId}, 'sitename username password', model)
            .then(function(res) {
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
                        errorMessage: 'No records found that matches userId and managerId combination',
                        data: res
                    });
                }
            }, function(rej) {
                //userId, managerId combination cannot be found in the database
                reject({
                    errorMessage: 'No records found that matches userId and managerId combination',
                    data: rej
                });
            });

    });
};