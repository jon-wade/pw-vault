var db = require('../db/database.js');

exports.check = function(username, password, model) {

    return new Promise(function(resolve, reject) {
        db.controller.read({username: username, password: password}, '_id', model).then(function(res) {
            if(res.length === 0) {
                //no user that matches that username and password combination
                reject({
                    errorMessage: 'Username and password combination do not match existing user.'
                });
            }
            else {
                resolve(res[0]);
            }
        });
    });

};
