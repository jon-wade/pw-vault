//create object containing db CRUD methods for Mongo
var controller = {
    'delete': function(data, schema){
        return new Promise(function(resolve, reject){
            schema.remove(data, function(err){
                if(err){
                    //error messages
                    console.log('Error removing data: ', err);
                    reject(err);
                }
                else {
                    //data removed
                    console.log('Data deleted: ', data);
                    resolve(data);
                }
            })
        });
    },
    'create': function(item, schema) {
        return new Promise(function(resolve, reject) {
            schema.create(item, function(err, data){
                if(err){
                    console.log('Error saving data: ', err);
                    reject(err);
                }
                else {
                    console.log('Data saved: ', data);
                    resolve(data);
                }
            });
        })
    },
    'update': function(item, content, schema) {
        return new Promise(function(resolve, reject){
            schema.findOneAndUpdate(item, content, function(err, data){
                if(err){
                    console.log('Error updating data: ', err);
                    reject(err);
                }
                else {
                    console.log('Updating: ', item, ' and found: ', data);
                    resolve(true);
                }
            });
        });
    },
    'read': function(item, field, schema) {
        return new Promise(function(resolve, reject) {
            schema.find(item, field, function (err, data) {
                if (err) {
                    console.log('Error reading data: ', err);
                    reject(err);
                }
                else {
                    console.log('Reading: ', item, ' and found ', data);
                    resolve(data);
                }
            });
        });
    }
};

exports.controller = controller;

