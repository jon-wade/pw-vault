var chai = require('chai');
var db = require('../app/db/database.js');
var mongoose = require('mongoose');
var mongooseConfig = require('../app/db/mongoose-config.js');
var chaiHttp = require('chai-http');

var index = require('../app/index.js');
var emailVerification = require('../app/utils/emailVerification.js');
var login = require('../app/utils/login.js');
var unit = require('./../app/utils/mailer.js');

var should = chai.should();
var expect = chai.expect;

var app = index.app;

chai.use(chaiHttp);

describe('unit test database.js functions', function() {

    it('should successfully create a new user in the database...', function(done) {
        //clean the database before starting the test
        db.controller.delete({}, mongooseConfig.userTest)
            //create new user
            .then(function(){
                db.controller.create({
                        'username': 'U2FsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLGw+g=',
                        'password': 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae',
                        'email': '6929f4d0f691db9262bf7b7bed5aff6f425d52e212006e9ad2de9aec3b9bfd4e'
                    }, mongooseConfig.userTest)
                    .then(function(res) {
                        res.should.be.a('object');
                        res.username.should.equal('U2FsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLGw+g=');
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
                'username':'U2FsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLGw+g='
            }, {}, mongooseConfig.userTest)
            .then(function(res) {
                res.should.be.a('array');
                res[0].should.have.property('_id');
                res[0].username.should.equal('U2FsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLGw+g=');
                res[0].password.should.equal('e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae');
                done();
            }, function(rej) {
                rej.should.be.undefined;
                done();
            });
    });

    it('when searching for a record that does not exist, should successfully respond with empty array ...', function(done) {
        db.controller.read({'username': 'jonwade'}, {}, mongooseConfig.userTest)
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
                'username': 'U2FsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLGw+g=',
                'password': 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae',
                'email': '6929f4d0f691db9262bf7b7bed5aff6f425d52e212006e9ad2de9aec3b9bfd4e'
            }, mongooseConfig.userTest)
            .then(function(res) {
                res.should.be.undefined;
                done();
            }, function(rej) {
                rej.should.be.a('object');
                rej.name.should.equal('MongoError');
                rej.code.should.equal(11000);
                rej.message.should.contain('U2FsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLGw+g=');
                done();
            });
    });

    it('should throw error when trying to create a username with less than 44 characters...', function(done) {
        db.controller.create({
                'username': 'U2FsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLG',
                'password': 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae',
                'email': '6929f4d0f691db9262bf7b7bed5aff6f425d52e212006e9ad2de9aec3b9bfd4e'
            }, mongooseConfig.userTest)
            .then(function(res) {
                res.should.be.undefined;
                done();
            }, function(rej) {
                rej.should.be.a('object');
                rej.name.should.equal('ValidationError');
                rej.errors.username.message.should.contain('shorter than the minimum allowed length');
                rej.errors.username.value.should.equal('U2FsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLG');
                done();
            });
    });

    it('should throw error when trying to create a password with less than 64 characters...', function(done) {
        db.controller.create({
                'username': 'U2FsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLGw+g=',
                'password': 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69',
                'email': '6929f4d0f691db9262bf7b7bed5aff6f425d52e212006e9ad2de9aec3b9bfd4e'
            }, mongooseConfig.userTest)
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

    it('should successfully update an existing user...', function(done) {
        db.controller.update({
                username: 'U2FsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLGw+g='
            },{
                password: 'abcde71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae'
            }, mongooseConfig.userTest)
            .then(function(res) {
                //console.log('res=', res);
                res.should.be.a('object');
                res.username.should.equal('U2FsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLGw+g=');
                done();
            }, function(rej) {
                rej.should.be.undefined;
                done();
            });
    });

    it('should not update a non-existent user...', function(done) {
        db.controller.update({
                username: 'ABCsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLGw+g='
            },{
                password: 'abcde71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae'
            }, mongooseConfig.userTest)
            .then(function(res) {
                expect(res).to.equal(null);
                done();
            }, function(rej) {
                rej.should.be.undefined;
                done();
            });
    });

    it('should successfully delete an existing user, returning "n" as 1...', function(done) {
        db.controller.delete({
                'username': 'U2FsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLGw+g='
            }, mongooseConfig.userTest)
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
                'username': 'sdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLGw+g='
            }, mongooseConfig.userTest)
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
                    done();
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

describe('unit test index.js server', function() {

    it('On /, should return the home page with a status 200, include a head tag and res.notFound should be false', function(done){
        chai.request(app)
            .get('/')
            .end(function(err, res) {
                res.should.have.status(200);
                res.text.should.include('<head>');
                res.notFound.should.equal(false);
                done();
            });
    });

    it('On page that does not exist, should return the home page, with a status 200, include a head tag and res.notFound should be false', function(done){
        chai.request(app)
            .get('/abc123')
            .end(function(err, res) {
                res.should.have.status(200);
                res.text.should.include('<head>');
                res.notFound.should.equal(false);
                done();
            });
    });
});

describe('unit test emailVerfication.js', function() {

    it('it should return "Registered email address" on successfully finding email in database...', function(done) {
        //create test user

        db.controller.create({
                username: "U2FsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLGw+g=",
                password: "e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae",
                email: "6929f4d0f691db9262bf7b7bed5aff6f425d52e212006e9ad2de9aec3b9bfd4e"
            }, mongooseConfig.userTest)
            .then(function() {
                emailVerification.check('6929f4d0f691db9262bf7b7bed5aff6f425d52e212006e9ad2de9aec3b9bfd4e', mongooseConfig.userTest)
                    .then(function(res) {
                        res.successMessage.should.include('Registered email address');
                        done();
                    },function(rej) {
                        console.log('rej=', rej);
                        rej.errorMessage.should.include('Not a registered email address');
                        done();
                    });
            });
        db.controller.delete({}, mongooseConfig.userTest);
    });

});

//describe('mailer unit test', function(){
//    this.timeout(15000);
//    it('On successful sending, data should be an object, data.response should be "250 Great success", data.accepted[0] should be "jonwadeuk@gmail.com", data.envelope.to[0] should be "jonwadeuk@gmail.com, data.envelope.from should be "admin@jonwade.codes" ...', function(done){
//        unit.send('jonwadeuk@gmail.com', 'success test', 'hello world!').then(function(data){
//            data.should.be.a('object');
//            data.response.should.equal('250 Great success');
//            data.accepted[0].should.equal('jonwadeuk@gmail.com');
//            data.envelope.to[0].should.equal('jonwadeuk@gmail.com');
//            data.envelope.from.should.equal('admin@jonwade.codes');
//            done();
//        });
//    });
//    it('On unsuccessful sending, an error message should be received', function(done){
//        unit.send('jonwadeukgmail.com', 'error test', 'this will not arrive').then(
//            function(success){
//                //testing error response, not success
//            },
//            function(data){
//                //console.log(data.code);
//                //console.log('keys', Object.keys(data));
//                data.code.should.include('EENVELOPE');
//                done();
//            });
//    });
//    //TODO: testing for bounced emails
//});