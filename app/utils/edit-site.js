var db = require('../db/database.js');

exports.go = function(managerId, username, password, model) {

    //console.log(managerId, username, password, model);

    return new Promise(function(resolve, reject) {

        db.controller.update({_id: managerId}, {username: username, password: password}, model)
            .then(function(res) {
                //successfully updated in database
                //console.log('editSite res=', res);
                resolve({
                    successMessage: 'site successfully updated',
                    data: res
                });
            }, function(rej) {
                //error updating database
                //console.log('editSite rej=', rej);
                reject({
                    errorMessage: 'site update failed',
                    data: rej
                });
            });
    });
};