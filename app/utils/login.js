var db = require('../db/database.js');
var mongooseConfig = require('../db/mongoose-config.js');

exports.check = function(username, password) {

    return new Promise(function(resolve, reject) {
        db.controller.read({username: username, password: password}, '_id', mongooseConfig.userDev).then(function(res) {
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
