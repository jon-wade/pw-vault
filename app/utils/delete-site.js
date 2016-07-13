var db = require('../db/database.js');

exports.go = function(managerId, model) {

    return new Promise(function(resolve, reject) {

        db.controller.delete({_id: managerId}, model)
            .then(function(res) {
                if (res.result.n > 0) {
                    resolve({
                        successMessage: 'site successfully deleted'
                    });
                }
                else {
                    reject({
                        errorMessage: 'site delete error: no record matches that _id'
                    });
                }
            }, function(rej) {
                //delete never throws a rejection but to be safe include an error handling routing
                console.log('delete-site rej=', rej);
                reject({
                    errorMessage: 'site delete error: mongo internal error',
                    data: rej
                });
            });
    });
};