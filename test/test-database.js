var chai = require('chai');
var db = require('../app/db/database.js');
var mongoose = require('../app/db/mongoose-config.js');

var should = chai.should();

describe('unit test database.js functions', function() {

    it('should successfully create a new user in the database...', function(done) {
        //clean the database before starting the test
        db.controller.delete({}, mongoose.tUser)
            //create new user
            .then(function(){
                db.controller.create({
                    'username': 'e51f18e34de728dcc0cb077b8df6db10fca7abd4e0bbb09324047883f48b0e01',
                    'password': 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae'
                }, mongoose.tUser)
                    .then(function(res) {
                        res.should.be.a('object');
                        res.username.should.equal('e51f18e34de728dcc0cb077b8df6db10fca7abd4e0bbb09324047883f48b0e01');
                        res.password.should.equal('e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae');
                        res.should.have.property('_id');
                        done();
                    }, function(rej) {
                        rej.should.be.undefined;
                        done();
                    });
            });
    });

    it('should successfully read the database and find an existing user returning all fields associated with that user...', function(done) {
        db.controller.read({
                'username':'e51f18e34de728dcc0cb077b8df6db10fca7abd4e0bbb09324047883f48b0e01'
            }, {}, mongoose.tUser)
            .then(function(res) {
                res.should.be.a('array');
                res[0].should.have.property('_id');
                res[0].username.should.equal('e51f18e34de728dcc0cb077b8df6db10fca7abd4e0bbb09324047883f48b0e01');
                res[0].password.should.equal('e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae');
                done();
            }, function(rej) {
                rej.should.be.undefined;
                done();
            });
    });

    it('when searching for a record that does not exist, should successfully respond with empty array ...', function(done) {
        db.controller.read({'username': 'jonwade'}, {}, mongoose.tUser)
            .then(function(res) {
                res.should.be.a('array');
                res.length.should.equal(0);
                done();
            }, function(rej) {
                rej.should.be.undefined;
                done();
            });
    });

    it('should throw error when trying to create a duplicate username...', function(done) {
        db.controller.create({
                'username': 'e51f18e34de728dcc0cb077b8df6db10fca7abd4e0bbb09324047883f48b0e01',
                'password': 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae'
            }, mongoose.tUser)
            .then(function(res) {
                res.should.be.undefined;
                done();
            }, function(rej) {
                rej.should.be.a('object');
                rej.name.should.equal('MongoError');
                rej.code.should.equal(11000);
                rej.message.should.contain('e51f18e34de728dcc0cb077b8df6db10fca7abd4e0bbb09324047883f48b0e01');
                done();
            });
    });

    it('should throw error when trying to create a username with less than 64 characters...', function(done) {
        db.controller.create({
                'username': 'e51f18e34de728dcc0cb077b8df6db10fca7abd4e0bbb09324047883f48b0e',
                'password': 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae'
            }, mongoose.tUser)
            .then(function(res) {
                res.should.be.undefined;
                done();
            }, function(rej) {
                rej.should.be.a('object');
                rej.name.should.equal('ValidationError');
                rej.errors.username.message.should.contain('shorter than the minimum allowed length');
                rej.errors.username.value.should.equal('e51f18e34de728dcc0cb077b8df6db10fca7abd4e0bbb09324047883f48b0e');
                done();
            });
    });

    it('should throw error when trying to create a password with less than 64 characters...', function(done) {
        db.controller.create({
                'username': 'e51f18e34de728dcc0cb077b8df6db10fca7abd4e0bbb09324047883f48b0e02',
                'password': 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69'
            }, mongoose.tUser)
            .then(function(res) {
                res.should.be.undefined;
                done();
            }, function(rej) {
                rej.should.be.a('object');
                rej.name.should.equal('ValidationError');
                rej.errors.password.message.should.contain('shorter than the minimum allowed length');
                rej.errors.password.value.should.equal('e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69');
                done();
            });
    });

    it('should successfully delete an existing user, returning "n" as 1...', function(done) {
        db.controller.delete({
                'username': 'e51f18e34de728dcc0cb077b8df6db10fca7abd4e0bbb09324047883f48b0e01'
        }, mongoose.tUser)
            .then(function(res) {
                res.should.be.a('object');
                res.result.ok.should.equal(1);
                res.result.n.should.equal(1);
                done();
            }, function(rej) {
                rej.should.be.undefined;
                done();
            });
    });

    it('should return "n" as zero when you try to delete a user that does not exist', function(done) {
        db.controller.delete({
            'username': 'e51f18e34de728dcc0cb077b8df6db10fca7abd4e0bbb09324047883f48b0e01'
        }, mongoose.tUser)
            .then(function(res) {
                res.should.be.a('object');
                res.result.ok.should.equal(1);
                res.result.n.should.equal(0);
                done();
            }, function(rej) {
                rej.should.be.undefined;
                done();
            });

        });


});