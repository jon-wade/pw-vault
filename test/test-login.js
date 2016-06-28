var chai = require('chai');
var login = require('../app/utils/login.js');
var mongooseConfig = require('../app/db/mongoose-config.js');
var db = require('../app/db/database.js');

var should = chai.should();

describe('login.js unit test', function() {

    it('should return an _id when username and password is found...', function(done) {
        db.controller.create({
            username: "U2FsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLGw+g=",
            password: "e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae",
            email: "6929f4d0f691db9262bf7b7bed5aff6f425d52e212006e9ad2de9aec3b9bfd4e"
        }, mongooseConfig.userTest)
            .then(function() {
                login.check('jonwade', 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae', mongooseConfig.userTest).then(function(res) {
                    //console.log('res=', res);
                    res.should.be.a('object');
                    res.should.have.property('_id');
                    done();
                }, function(rej) {
                    console.log('rej=', rej);
                    //done();
                });
            });
    });

    it('should return an error when username and password is not found...', function(done) {
        login.check('jonwad', 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae', mongooseConfig.userTest).then(function(res) {
            console.log('res=', res);
            done();
        }, function(rej) {
            rej.should.be.a('object');
            rej.errorMessage.should.equal('Username and password combination do not match existing user.');
            db.controller.delete({}, mongooseConfig.userTest);
            done();
        });
    });

});
