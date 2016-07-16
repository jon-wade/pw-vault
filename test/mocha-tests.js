var chai = require('chai');
var chaiHttp = require('chai-http');
var mockery = require('mockery');

chai.use(chaiHttp);
var should = chai.should();

describe('login.js unit test', function() {

    var login, mongooseConfig;
    beforeEach(function(done) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: true
        });

        mongooseConfig = {};
        mongooseConfig.userTest = {};
        mongooseConfig.userDev = {};

        //mockDb
        var mockDb = {};
        mockDb.controller = {
            read: function(username, password, model) {
                return new Promise(function(resolve, reject) {
                    if(model != mongooseConfig.userTest){
                        reject('mocked db access error');
                    }
                    else {
                        resolve([{
                            _id: '57786733eeb287e63a404933',
                            username: 'U2FsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLGw+g=',
                            password: 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae'
                        }]);
                    }
                });
            }
        };

        mockery.registerMock('../db/database.js', mockDb);

        //this is the crypto library
        mockery.registerAllowables(['crypto-js', './core', './x64-core', './lib-typedarrays', './enc-utf16', './md5', './sha1', './sha256', './sha224', './enc-base64', './sha512', './sha384', './sha3', './ripemd160', './hmac', './pbkdf2', './evpkdf', './cipher-core', './mode-cfb', './mode-ctr', './mode-ctr-gladman', './mode-ofb', './mode-ecb', './pad-ansix923', './pad-iso10126', './pad-iso97971', './pad-zeropadding', './pad-nopadding', './format-hex', './aes', './tripledes', './rc4', './rabbit', './rabbit-legacy', './../app/utils/login.js', './secret.js']);

        login = require('./../app/utils/login.js');

        done();


    });

    afterEach(function(done) {
        mockery.deregisterAll();
        mockery.disable();
        done();
    });



    it('should return an _id when username and password is found and match in the db...', function (done) {

        login.check('jonwade', 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae', mongooseConfig.userTest).then(function (res) {
            //console.log('resolved...', res);
            res.should.be.a('object');
            res.should.have.property('_id');
            done();
        }, function (rej) {
            //console.log('rejected...', rej);
            rej.should.be.a('object');
            rej.should.have.property('errorMessage');
            done();
        });

    });

    it('should return an error when username is not found...', function (done) {

        login.check('jonwad', 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae', mongooseConfig.userTest).then(function (res) {
            //console.log('resolved...', res);
            res.should.be.a('object');
            res.should.have.property('_id');
            done();
        }, function (rej) {
            //console.log('rejected...', rej);
            rej.should.be.a('object');
            rej.should.have.property('errorMessage');
            done();
        });

    });

    it('should return an error when an incorrect model is passed...', function (done) {

        login.check('jonwade', 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae', mongooseConfig.userDev).then(function (res) {
            //console.log('resolved...', res);
            res.should.be.a('object');
            res.should.have.property('_id');
            done();
        }, function (rej) {
            //console.log('rejected...', rej);
            rej.should.be.a('object');
            rej.should.have.property('errorMessage');
            rej.should.have.property('error');
            done();
        });

    });

});

describe('mailer.js unit test', function() {

    var mailer;
    beforeEach(function(done) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        var mockNodemailer = {
            createTransport: function() {
                //this is just returning an object with a sendMail method
                return {
                    sendMail: function(mailOptions, callback) {
                        if (mailOptions.to === 'jonwadeuk@gmail.com') {
                            //console.log('calling send mail with mailOptions...', mailOptions);
                            var mockResponse = {
                                response: '250 Great success',
                                accepted: ['jonwadeuk@gmail.com'],
                                envelope: {
                                    to: ['jonwadeuk@gmail.com'],
                                    from: 'admin@jonwade.codes'
                                }
                            };
                            callback(false, mockResponse);
                        }
                        else if (mailOptions.to === 'jonwadeukgmail.com') {
                            var mockError = {
                                code: 'EENVELOPE'
                            };
                            callback(mockError);
                        }

                    }
                };
            }
        };

        mockery.registerMock('nodemailer', mockNodemailer);

        mailer = require('./../app/utils/mailer.js');
        done();
    });

    afterEach(function(done) {
        mockery.deregisterAll();
        mockery.disable();
        done();
    });

    it('On successful sending, data should be an object, res.response should be "250 Great success", res.accepted[0] should be "jonwadeuk@gmail.com", res.envelope.to[0] should be "jonwadeuk@gmail.com, res.envelope.from should be "admin@jonwade.codes" ...', function(done) {

        mailer.send('jonwadeuk@gmail.com', 'success test', 'hello world!').then(function (res) {
            res.should.be.a('object');
            res.response.should.equal('250 Great success');
            res.accepted[0].should.equal('jonwadeuk@gmail.com');
            res.envelope.to[0].should.equal('jonwadeuk@gmail.com');
            res.envelope.from.should.equal('admin@jonwade.codes');
            done();
        }, function(rej) {
            //err return from .send() promise
        });
    });

    it('On unsuccessful sending, an error message should be received', function(done){
        mailer.send('jonwadeukgmail.com', 'error test', 'this will not arrive').then(
            function(success){
                //testing error response, not success
            },
            function(rej){
                //console.log(rej);
                //console.log('keys', Object.keys(rej));
                rej.code.should.include('EENVELOPE');
                done();
            });
    });

});

describe('registration.js unit test', function() {

    var mongooseConfig, registration, mockDb;
    beforeEach(function(done) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        mongooseConfig = {};
        mongooseConfig.userTest = {};
        mongooseConfig.userDev = {};

        mockDb = {};
        mockDb.controller = {
            create: function(userObj, model) {
                return new Promise(function(resolve, reject) {
                    if(model != mongooseConfig.userTest){
                        reject('mocked db access error');
                    }
                    else if (userObj.password !== 'hashedPassword' || userObj.email !== 'encryptedEmail') {
                        reject({});
                    }
                    else if(userObj.password === 'hashedPassword' && userObj.email === 'duplicateEmail') {
                        reject({});
                    }
                    else {
                        resolve({});
                    }
                });
            }
        };

        mockery.registerMock('../db/database.js', mockDb);

        registration = require('./../app/utils/registration.js');

        done();
    });

    afterEach(function(done) {
        mockery.deregisterAll();
        mockery.disable();
        done();

    });

    it('should return successMessage "user successfully created"...', function(done) {
        registration.create('testuser', 'hashedPassword', 'encryptedEmail', mongooseConfig.userTest).then(function(res) {
            //successful registration
            res.should.be.a('object');
            res.should.have.a.property('successMessage');
            res.should.have.a.property('data');
            res.successMessage.should.include('user successfully created');
            done();
        }, function(rej) {
            //failed registration
            rej.should.be.a('object');
            rej.should.have.a.property('errorMessage');
            rej.should.have.a.property('data');
            rej.errorMessage.should.include('user creation failed');
            done();
        });

    });

    it('should return errorMessage "user creation failed" when trying to create a duplicate user with a duplicate email...', function(done) {
        registration.create('testuser', 'hashedPassword', 'duplicateEmail', mongooseConfig.userTest).then(function(res) {
            //successful registration
            //console.log('res=', res);
            res.should.be.a('object');
            res.should.have.a.property('successMessage');
            res.should.have.a.property('data');
            res.successMessage.should.include('user successfully created');
            done();
        }, function(rej) {
            //failed registration
            //console.log('rej=', rej);
            rej.should.be.a('object');
            rej.should.have.a.property('errorMessage');
            rej.should.have.a.property('data');
            rej.errorMessage.should.include('user creation failed');
            done();
        });

    });
});

describe('add-site.js unit test', function() {

    var mongooseConfig, registration, mockDb;
    beforeEach(function(done) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        mongooseConfig = {};
        mongooseConfig.managerTest = {};
        mongooseConfig.managerDev = {};

        mockDb = {};
        mockDb.controller = {
            create: function(obj, model) {
                return new Promise(function(resolve, reject) {
                    if(model != mongooseConfig.managerTest){
                        reject('mocked db access error');
                    }
                    else if (obj.userId !== '12345' || obj.sitename !=='sitename' || obj.password !== 'encryptedPassword' || obj.username !== 'encryptedUsername') {
                        reject({});
                    }
                    else {
                        resolve({});
                    }
                });
            }
        };

        mockery.registerMock('../db/database.js', mockDb);

        addSite = require('./../app/utils/add-site.js');

        done();
    });

    afterEach(function(done) {
        mockery.deregisterAll();
        mockery.disable();
        done();

    });

    it('should return successMessage "record successfully created"...', function(done) {
        addSite.go('12345','sitename', 'encryptedUsername', 'encryptedPassword', mongooseConfig.managerTest).then(function(res) {
            //successfully added site record
            res.should.be.a('object');
            res.should.have.a.property('successMessage');
            res.should.have.a.property('data');
            res.successMessage.should.include('record successfully created');
            done();
        }, function(rej) {
            //failed registration
            rej.should.be.a('object');
            rej.should.have.a.property('errorMessage');
            rej.should.have.a.property('data');
            rej.errorMessage.should.include('record creation failed');
            //done();
        });

    });

    it('should return errorMessage "record creation failed"...', function(done) {
        addSite.go('54321', 'errorSitename', 'errorUsername', 'errorPassword', mongooseConfig.managerTest).then(function(res) {
            //successfully added site record
            res.should.be.a('object');
            res.should.have.a.property('successMessage');
            res.should.have.a.property('data');
            res.successMessage.should.include('record successfully created');
            //done();
        }, function(rej) {
            //failed registration
            rej.should.be.a('object');
            rej.should.have.a.property('errorMessage');
            rej.should.have.a.property('data');
            rej.errorMessage.should.include('record creation failed');
            done();
        });

    });


});

describe('site-list.js unit test', function() {

    var mongooseConfig, siteList, mockDb;
    beforeEach(function(done) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        mongooseConfig = {};
        mongooseConfig.managerTest = {};
        mongooseConfig.managerDev = {};

        mockDb = {};
        mockDb.controller = {
            read: function(query, fields, model) {
                //console.log('query=', query);
                //console.log('fields=', fields);
                //console.log('model=', model);
                return new Promise(function(resolve, reject) {
                    if(model != mongooseConfig.managerTest){
                        reject('mocked db access error');
                    }
                    else if (query.userId !== '12345') {
                        reject([]);
                    }
                    else {
                        resolve(['site1', 'site2']);
                    }
                });
            }
        };

        mockery.registerMock('../db/database.js', mockDb);

        siteList = require('./../app/utils/site-list.js');

        done();
    });

    afterEach(function(done) {
        mockery.deregisterAll();
        mockery.disable();
        done();

    });

    it('should return successMessage "success, array attached"...', function(done) {
        siteList.go('12345', mongooseConfig.managerTest).then(function(res) {
            //successfully added site record
            //console.log('res=', res);
            res.should.be.a('object');
            res.should.have.a.property('successMessage');
            res.should.have.a.property('data');
            res.successMessage.should.include('success, array attached');
            done();
        }, function(rej) {
            //failed registration
            //console.log('rej=', rej);
            rej.should.be.a('object');
            rej.should.have.a.property('errorMessage');
            rej.should.have.a.property('data');
            rej.errorMessage.should.include('No records found');
            //done();
        });

    });

    it('should return errorMessage "No records found"...', function(done) {
        siteList.go('54321', mongooseConfig.managerTest).then(function(res) {
            //successfully added site record
            //console.log('res=', res);
            res.should.be.a('object');
            res.should.have.a.property('successMessage');
            res.should.have.a.property('data');
            res.successMessage.should.include('success, array attached');
            //done();
        }, function(rej) {
            //failed registration
            //console.log('rej=', rej);
            rej.should.be.a('object');
            rej.should.have.a.property('errorMessage');
            rej.should.have.a.property('data');
            rej.errorMessage.should.include('No records found');
            done();
        });

    });


});

describe('retrieve-site.js unit test', function() {

    var mongooseConfig, retrieveSite, mockDb;
    beforeEach(function(done) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        mongooseConfig = {};
        mongooseConfig.managerTest = {};
        mongooseConfig.managerDev = {};

        mockDb = {};
        mockDb.controller = {
            read: function(query, fields, model) {
                //console.log('query=', query);
                //console.log('fields=', fields);
                //console.log('model=', model);
                return new Promise(function(resolve, reject) {
                    if(model != mongooseConfig.managerTest){
                        reject('mocked db access error');
                    }
                    else if (query.userId !== '12345' || query._id !== '98765') {
                        reject([]);
                    }
                    else {
                        resolve(['site1']);
                    }
                });
            }
        };

        mockery.registerMock('../db/database.js', mockDb);

        retrieveSite = require('./../app/utils/retrieve-site.js');

        done();
    });

    afterEach(function(done) {
        mockery.deregisterAll();
        mockery.disable();
        done();

    });

    it('should return successMessage "success, array attached"...', function(done) {
        retrieveSite.go('12345', '98765', mongooseConfig.managerTest).then(function(res) {
            //successfully retrieved site
            //console.log('res=', res);
            res.should.be.a('object');
            res.should.have.a.property('successMessage');
            res.should.have.a.property('data');
            res.successMessage.should.include('success, array attached');
            done();
        }, function(rej) {
            //failed to retrieve site
            //console.log('rej=', rej);
            rej.should.be.a('object');
            rej.should.have.a.property('errorMessage');
            rej.should.have.a.property('data');
            rej.errorMessage.should.include('No records found');
            //done();
        });

    });

    it('should return errorMessage "No records found"...', function(done) {
        retrieveSite.go('54321', '98765', mongooseConfig.managerTest).then(function(res) {
            //successfully retrieved
            //console.log('res=', res);
            res.should.be.a('object');
            res.should.have.a.property('successMessage');
            res.should.have.a.property('data');
            res.successMessage.should.include('success, array attached');
            //done();
        }, function(rej) {
            //failed to retrieve site
            //console.log('rej=', rej);
            rej.should.be.a('object');
            rej.should.have.a.property('errorMessage');
            rej.should.have.a.property('data');
            rej.errorMessage.should.include('No records found');
            done();
        });

    });

});

describe('edit-site.js unit test', function() {

    var mongooseConfig, editSite, mockDb;
    beforeEach(function(done) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        mongooseConfig = {};
        mongooseConfig.managerTest = {};
        mongooseConfig.managerDev = {};

        mockDb = {};
        mockDb.controller = {
            update: function(query, content, model) {
                //console.log('query=', query);
                //console.log('fields=', content);
                //console.log('model=', model);
                return new Promise(function(resolve, reject) {
                    if(model != mongooseConfig.managerTest){
                        reject('mocked db access error');
                    }
                    else if (query._id !== '12345') {
                        reject([]);
                    }
                    else {
                        resolve([]);
                    }
                });
            }
        };

        mockery.registerMock('../db/database.js', mockDb);

        editSite = require('./../app/utils/edit-site.js');

        done();
    });

    afterEach(function(done) {
        mockery.deregisterAll();
        mockery.disable();
        done();

    });

    it('should return successMessage "site successfully updated"...', function(done) {
        editSite.go('12345', '', '', mongooseConfig.managerTest).then(function(res) {
            //successfully retrieved site
            //console.log('res=', res);
            res.should.be.a('object');
            res.should.have.a.property('successMessage');
            res.should.have.a.property('data');
            res.successMessage.should.include('site successfully updated');
            done();
        }, function(rej) {
            //failed to retrieve site
            //console.log('rej=', rej);
            rej.should.be.a('object');
            rej.should.have.a.property('errorMessage');
            rej.should.have.a.property('data');
            rej.errorMessage.should.include('site update failed');
            //done();
        });

    });

    it('should return errorMessage "site update failed"...', function(done) {
        editSite.go("54321", '', '', mongooseConfig.managerTest).then(function(res) {
            //successfully retrieved
            //console.log('res=', res);
            res.should.be.a('object');
            res.should.have.a.property('successMessage');
            res.should.have.a.property('data');
            res.successMessage.should.include('site successfully updated');
            //done();
        }, function(rej) {
            //failed to retrieve site
            //console.log('rej=', rej);
            rej.should.be.a('object');
            rej.should.have.a.property('errorMessage');
            rej.should.have.a.property('data');
            rej.errorMessage.should.include('site update failed');
            done();
        });

    });

});

describe('delete-site.js unit test', function() {

    var mongooseConfig, deleteSite, mockDb;
    beforeEach(function(done) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        mongooseConfig = {};
        mongooseConfig.managerTest = {};
        mongooseConfig.managerDev = {};

        mockDb = {};
        mockDb.controller = {
            delete: function(data, model) {
                return new Promise(function(resolve, reject) {
                    if(model != mongooseConfig.managerTest){
                        reject('mocked db access error');
                    }
                    else if (data._id !== '12345') {
                        reject({
                            errorMessage: 'error deleting data'
                        });
                    }
                    else {
                        resolve({
                            successMessage: 'success deleting data',
                            result: {
                                n: 1
                            }
                        });
                    }
                });
            }
        };

        mockery.registerMock('../db/database.js', mockDb);

        deleteSite = require('./../app/utils/delete-site.js');

        done();
    });

    afterEach(function(done) {
        mockery.deregisterAll();
        mockery.disable();
        done();

    });

    it('should return successMessage "site successfully deleted"...', function(done) {
        deleteSite.go('12345', mongooseConfig.managerTest).then(function(res) {
            //successfully deleted site
            //console.log('res=', res);
            res.should.be.a('object');
            res.should.have.a.property('successMessage');
            res.successMessage.should.include('site successfully deleted');
            done();
        }, function(rej) {
            //failed to retrieve site
            //console.log('rej=', rej);
            rej.should.be.a('object');
            rej.should.have.a.property('errorMessage');
            rej.should.have.a.property('data');
            rej.errorMessage.should.include('site delete error');
            //done();
        });

    });

    it('should return errorMessage "site delete error"...', function(done) {
        deleteSite.go('54321', mongooseConfig.managerTest).then(function(res) {
            //successfully deleted site
            //console.log('res=', res);
            res.should.be.a('object');
            res.should.have.a.property('successMessage');
            res.successMessage.should.include('site successfully deleted');
            //done();
        }, function(rej) {
            //failed to retrieve site
            //console.log('rej=', rej);
            rej.should.be.a('object');
            rej.should.have.a.property('errorMessage');
            rej.should.have.a.property('data');
            rej.errorMessage.should.include('site delete error');
            done();
        });

    });

});

describe('password-update.js unit test', function() {

    var mongooseConfig, passwordUpdate, mockDb, usernameVerificationMock, emailVerificationMock;

    beforeEach(function(done) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        mongooseConfig = {};
        mongooseConfig.userTest = {};
        mongooseConfig.userDev = {};

        //mockDb
        mockDb = {};
        mockDb.controller = {
            update: function(item, content, model) {
                return new Promise(function(resolve, reject) {
                    //console.log('item._id=', item._id);
                    if(model != mongooseConfig.userTest) {
                        reject('mocked db access error');
                    }
                    else if (item._id === '57786733eeb287e63a404933') {
                        resolve({});
                    }
                    else {
                        reject({});
                    }
                });
            }
        };

        //emailVerificationMock
        emailVerificationMock = {
            check: function(email, model) {
                return new Promise(function(resolve, reject) {
                    if(email === 'jonwadeuk@gmail.com') {
                        resolve({
                            successMessage: 'Registered email address',
                            _id: '57786733eeb287e63a404933'
                        });
                    }
                    if(email === 'test@test.com') {
                        resolve({
                            successMessage: 'Registered email address',
                            _id: '577b4a7b01591dba09030cf8'
                        });
                    }
                    else {
                        reject({
                            errorMessage: 'not a registered email address.'
                        });
                    }
                });
            }

        };

        //usernameVerificationMock
        usernameVerificationMock = {
            check: function(username, model) {
                return new Promise(function(resolve, reject) {
                    if(username === 'jonwade') {
                        resolve({
                            successMessage: 'Registered username',
                            _id: '57786733eeb287e63a404933'

                        });
                    }
                    else if (username === 'testuser') {
                        resolve({
                            successMessage: 'Registered username',
                            _id: '577b4a7b01591dba09030cf8'
                        });
                    }
                    else {
                        reject({
                            errorMessage: 'not a registered username'
                        });
                    }
                });
            }
        };


        mockery.registerMock('../db/database.js', mockDb);
        mockery.registerMock('../utils/username-verification.js', usernameVerificationMock);
        mockery.registerMock('../utils/email-verification.js', emailVerificationMock);

        passwordUpdate = require('../app/utils/password-update.js');

        done();
    });

    afterEach(function(done) {
        mockery.deregisterAll();
        mockery.disable();
        done();

    });

    it('should return "ids match, all is well..." if the id of the email and the username are the same...', function(done) {
        passwordUpdate.go('jonwade', 'jonwadeuk@gmail.com', 'newpassword', mongooseConfig.userTest).then(function(res) {
            //should be in this branch as we're testing a success
            //console.log('res=', res);
            res.should.be.a('object');
            res.successMessage.should.include('all is well');
            done();
        }, function(rej) {
            //shouldn't be in this branch so no done()
            //console.log('rej=', rej);
        });

    });

    it('should return "not a registered username" if the username cannot be found in the database...', function(done) {
        passwordUpdate.go('jonwad', 'jonwadeuk@gmail.com', 'newpassword', mongooseConfig.userTest).then(function(res) {
            //should be in this branch as we're testing a success
            //console.log('res=', res);
        }, function(rej) {
            //shouldn't be in this branch so no done()
            //console.log('rej=', rej);
            rej.should.be.a('object');
            rej.errorMessage.should.include('not a registered username');
            done();
        });

    });

    it('should return "not a registered email" if the email cannot be found in the database...', function(done) {
        passwordUpdate.go('jonwade', 'error@error.com', 'newpassword', mongooseConfig.userTest).then(function(res) {
            //should be in this branch as we're testing a success
            //console.log('res=', res);
        }, function(rej) {
            //shouldn't be in this branch so no done()
            //console.log('rej=', rej);
            rej.should.be.a('object');
            rej.errorMessage.should.include('not a registered email');
            done();
        });

    });

    it('should return "the _ids for the username and email do not match and we cannot update the password..." if the id of the email and the username are not the same...', function(done) {
        passwordUpdate.go('jonwade', 'test@test.com', 'newpassword', mongooseConfig.userTest).then(function(res) {
            //should be in this branch as we're testing a success
            //console.log('res=', res);
        }, function(rej) {
            //shouldn't be in this branch so no done()
            //console.log('rej=', rej);
            rej.should.be.a('string');
            rej.should.include('do not match');
            done();
        });

    });

});

describe('email-verification.js unit test', function() {

    var mongooseConfig, emailVerification, mockDb;
    beforeEach(function(done) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        mongooseConfig = {};
        mongooseConfig.userTest = {};
        mongooseConfig.userDev = {};

        //mockDb
        mockDb = {};
        mockDb.controller = {
            read: function(query, params, model) {
                return new Promise(function(resolve, reject) {
                    if(model != mongooseConfig.userTest) {
                        reject('mocked db access error');
                    }
                    else if (query.email !== 'encryptedEmail') {
                        resolve([]);
                    }
                    else {
                        resolve([{
                            _id: '57786733eeb287e63a404933'
                        }]);
                    }
                });
            }
        };

        mockery.registerMock('../db/database.js', mockDb);

        emailVerification = require('./../app/utils/email-verification.js');

        done();
    });

    afterEach(function(done) {
        mockery.deregisterAll();
        mockery.disable();
        done();

    });

    it('should return "Registered email address" on successfully finding email in database...', function(done) {
        emailVerification.check('encryptedEmail', mongooseConfig.userTest).then(function(res) {
            res.successMessage.should.include('Registered email address');
            res.should.have.property('_id');
            done();
        }, function(rej) {
            rej.errorMessage.should.include('Not a registered email address');
            done();

        });
    });

    it('should return "Not a registered email address" on failing to find email in database...', function(done) {
        emailVerification.check('wrongEmail', mongooseConfig.userTest).then(function(res) {
            //console.log('res=', res);
            res.successMessage.should.include('Registered email address');
            res.should.have.property('_id');
            done();
        }, function(rej) {
            //console.log('rej=', rej);
            rej.errorMessage.should.include('Not a registered email address');
            done();

        });
    });

});

describe('username-verification.js unit test', function() {

    var mongooseConfig, mockDb, usernameVerification;
    beforeEach(function(done) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        //mongooseConfig Mock
        mongooseConfig = {};
        mongooseConfig.userTest = {};
        mongooseConfig.userDev = {};

        //mockDb
        mockDb = {};
        mockDb.controller = {
            read: function(query, params, model) {
                return new Promise(function(resolve, reject) {
                    if(model != mongooseConfig.userTest) {
                        reject('mocked db access error');
                    }
                    else {
                        resolve([{
                            _id: '57786733eeb287e63a404933',
                            username: 'U2FsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLGw+g='
                        }]);
                    }
                });
            }
        };

        mockery.registerMock('../db/database.js', mockDb);
        mockery.registerAllowable('../utils/secret.js');

        usernameVerification = require('./../app/utils/username-verification.js');

        done();
    });

    afterEach(function(done) {
        mockery.deregisterAll();
        mockery.disable();
        done();
    });

    it('should return "Registered username" on successfully finding username in database...', function(done) {
        usernameVerification.check('jonwade', mongooseConfig.userTest).then(function(res) {
            res.successMessage.should.include('Registered username');
            res.should.have.property('_id');
            done();
        }, function(rej) {
            rej.errorMessage.should.include('Not a registered username');
            done();
        });
    });

    it('should return "Not a registered username" on failing to find username in database...', function(done) {
        usernameVerification.check('jonwad', mongooseConfig.userTest).then(function(res) {
            res.successMessage.should.include('Registered username');
            res.should.have.property('_id');
            done();
        }, function(rej) {
            rej.errorMessage.should.include('Not a registered username');
            done();
        });
    });

});

describe('username-recovery.js unit test', function() {

    var usernameRecovery, mockDb, mockMailer, mongooseConfig;
    beforeEach(function(done) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        //mongooseConfig Mock
        mongooseConfig = {};
        mongooseConfig.userTest = {};
        mongooseConfig.userDev = {};

        //mockDb
        mockDb = {};
        mockDb.controller = {
            read: function(query, params, model) {
                return new Promise(function(resolve, reject) {
                    if(model != mongooseConfig.userTest) {
                        reject('mocked db access error');
                    }
                    else if (query._id !== '57786733eeb287e63a404933') {
                        reject();
                    }
                    else {
                        resolve([{
                            _id: '57786733eeb287e63a404933',
                            username: 'U2FsdGVkX1/NBSdklPl+/Fs252YIHGOc5/+9KjLGw+g='
                        }]);
                    }
                });
            }
        };

        //mockMailer
        mockMailer = {
            send: function(email, subject, message) {
                return new Promise(function(resolve, reject) {
                    if (email === 'jonwadeuk@gmail.com') {
                        resolve();
                    }
                    else if (email === 'jonwadeukgmail.com') {
                        reject();
                    }
                });
            }
        };

        mockery.registerMock('../db/database.js', mockDb);
        mockery.registerMock('../utils/mailer.js', mockMailer);
        mockery.registerAllowable('../utils/secret.js');

        usernameRecovery = require('./../app/utils/username-recovery.js');
        done();

    });

    afterEach(function(done) {
        mockery.deregisterAll();
        mockery.disable();
        done();
    });

    it('on successful mailing of username, it should return object containing a successMessage property...', function(done) {
        usernameRecovery.go('57786733eeb287e63a404933', 'jonwadeuk@gmail.com', mongooseConfig.userTest).then(function(res) {
            res.should.be.a('object');
            res.should.have.a.property('successMessage');
            done();
        }, function(rej) {
            should.have(rej, null);
            done();
        });
    });

    it('should return an object with an errorMessage property if email address is incorrectly formatted...', function(done) {
        usernameRecovery.go('57786733eeb287e63a404933', 'jonwadeukgmail.com', mongooseConfig.userTest).then(function(res) {
            should.have(res, null);
            done();
        }, function(rej) {
            rej.should.be.a('object');
            rej.should.have.a.property('errorMessage');
            done();
        });
    });

    it('should return an object with an errorMessage if no match in the database against the submitted id...', function(done) {
        usernameRecovery.go('1234567', 'jonwadeuk@gmail.com', mongooseConfig.userTest).then(function(res) {
            should.have(res, null);
            done();
        }, function(rej) {
            rej.should.be.a('object');
            rej.should.have.a.property('errorMessage');
            done();
        })
    });




});

describe('password-recovery.js unit test', function() {

    var passwordRecovery, mockDb, mockMailer, mongooseConfig;
    beforeEach(function(done) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        //mongooseConfig Mock
        mongooseConfig = {};
        mongooseConfig.userTest = {};
        mongooseConfig.userDev = {};

        //mockDb
        mockDb = {};
        mockDb.controller = {
            read: function(query, params, model) {
                return new Promise(function(resolve, reject) {
                    if(model != mongooseConfig.userTest) {
                        reject('mocked db access error');
                    }
                    else if (query._id !== '57786733eeb287e63a404933') {
                        reject();
                    }
                    else {
                        resolve([{
                            _id: '57786733eeb287e63a404933',
                            email : '6929f4d0f691db9262bf7b7bed5aff6f425d52e212006e9ad2de9aec3b9bfd4e'
                        }]);
                    }
                });
            }
        };

        //mockMailer
        mockMailer = {
            send: function(email, subject, message) {
                return new Promise(function(resolve, reject) {
                    if (email === 'jonwadeuk@gmail.com') {
                        resolve();
                    }
                    else if (email === 'jonwadeukgmail.com') {
                        reject();
                    }
                });
            }
        };

        mockery.registerMock('../db/database.js', mockDb);
        mockery.registerMock('../utils/mailer.js', mockMailer);


        passwordRecovery = require('./../app/utils/password-recovery.js');
        done();

    });

    afterEach(function(done) {
        mockery.deregisterAll();
        mockery.disable();
        done();
    });

    it('on successful mailing of password, it should return object containing a successMessage property...', function(done) {
        passwordRecovery.go('57786733eeb287e63a404933', 'jonwadeuk@gmail.com', mongooseConfig.userTest).then(function(res) {
            res.should.be.a('object');
            res.should.have.a.property('successMessage');
            done();
        }, function(rej) {
            should.have(rej, null);
            done();
        });
    });

    it('should return an object with an errorMessage property if email address is incorrectly formatted...', function(done) {
        passwordRecovery.go('57786733eeb287e63a404933', 'jonwadeukgmail.com', mongooseConfig.userTest).then(function(res) {
            should.have(res, null);
            done();
        }, function(rej) {
            rej.should.be.a('object');
            rej.should.have.a.property('errorMessage');
            done();
        });
    });

    it('should return an object with an errorMessage if no match in the database against the submitted id...', function(done) {
        passwordRecovery.go('1234567', 'jonwadeuk@gmail.com', mongooseConfig.userTest).then(function(res) {
            should.have(res, null);
            done();
        }, function(rej) {
            rej.should.be.a('object');
            rej.should.have.a.property('errorMessage');
            done();
        })
    });




});

describe('index.js unit test', function() {

    console.log('still need to isolate express dependencies for index.js test...');

    var mongooseConfigMock, app, index, loginMock, emailVerificationMock, usernameVerificationMock, usernameRecoveryMock, passwordRecoveryMock, registrationMock, passwordUpdateMock, addSiteMock, siteListMock, retrieveSiteMock, deleteSiteMock, editSiteMock;
    beforeEach(function(done) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        mongooseConfigMock = {};

        mongooseConfigMock.userDev = {};

        loginMock = {
            check: function(username, password, model) {
                return new Promise(function(resolve, reject) {
                    if (username === 'jonwade' && password === 'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae') {
                        resolve({
                            _id : '57786733eeb287e63a404933'
                        });
                    }
                    else {
                        reject({
                            errorMessage: 'Username and password combination do not match existing user.'
                        });
                    }
                });

            }
        };

        emailVerificationMock = {
            check: function(email, model) {
                return new Promise(function(resolve, reject) {
                    if (email !== '6929f4d0f691db9262bf7b7bed5aff6f425d52e212006e9ad2de9aec3b9bfd4e') {
                        reject({
                            errorMessage: 'Not a registered email address.'
                        });
                    }
                    else {
                        resolve({
                            successMessage: 'Registered email address',
                            _id: '57786733eeb287e63a404933'
                        });
                    }
                });
            }

        };

        usernameVerificationMock = {
            check: function(username, model) {
                return new Promise(function(resolve, reject) {
                    if(username === 'jonwade') {
                        resolve({
                            successMessage: 'Registered username',
                            _id: '57786733eeb287e63a404933'

                        });
                    }
                    else {
                        reject({
                            errorMessage: 'Not a registered username'
                        });
                    }
                });
            }
        };

        usernameRecoveryMock = {
            go: function(id, email, model) {
                return new Promise(function(resolve, reject) {
                    if (email === 'jonwadeukgmail.com') {
                        reject({
                            errorMessage: 'Email incorrectly formatted'
                        });
                    }
                    else if (id === '57786733eeb287e63a404933') {
                        resolve({
                            successMessage: 'Username has been successfully dispatched by the mailer program.'
                        });
                    }
                    else {
                        reject({
                            errorMessage: 'No username found that matches _id.'
                        });
                    }
                });
            }

        };

        passwordRecoveryMock = {
            go: function(id, email, model) {
                return new Promise(function(resolve, reject) {
                    if (email === 'jonwadeukgmail.com') {
                        reject({
                            errorMessage: 'Email incorrectly formatted'
                        });
                    }
                    else if (id === '57786733eeb287e63a404933') {
                        resolve({
                            successMessage: 'Password link has been successfully dispatched by the mailer program.'
                        });
                    }
                    else {
                        reject({
                            errorMessage: 'No user found that matches _id.'
                        });
                    }
                });
            }

        };

        registrationMock = {
            create: function(username, password, email, model) {
                return new Promise(function(resolve, reject) {
                    if(username !=='testuser' || password !=='testpassword' || email !== 'testemail') {
                        reject({errorMessage: 'user creation failed'});
                    }
                    else {
                        resolve({successMessage: 'user successfully created', data: {_id: '1234'}});
                    }
                });

            }
        };

        passwordUpdateMock = {
            go: function(username, email, password, model) {
                return new Promise(function(resolve, reject) {
                    if(username !=='testuser' || password !=='testpassword' || email !== 'testemail') {
                        reject({errorMessage: 'password update failed'});
                    }
                    else {
                        resolve({successMessage: 'password update successful', data: {_id: '1234'}});
                    }

                });
            }

        };

        addSiteMock = {
            go: function(userId, sitename, username, password, model) {
                return new Promise(function(resolve, reject) {
                    if(userId !== '12345' || sitename !== 'sitename' || username !== 'encryptedUsername' || password !== 'encryptedPassword') {
                        reject({
                            errorMessage: 'add site error'
                        });
                    }
                    else {
                        resolve({successMessage: 'add site success', data: {}});
                    }
                });
            }
        };

        siteListMock = {
            go: function(userId) {
                return new Promise(function(resolve, reject) {
                    if(userId !== '12345') {
                        reject({
                            errorMessage: 'site list error'
                        });
                    }
                    else {
                        resolve({successMessage: 'site list success', data: {}});
                    }
                });
            }
        };

        retrieveSiteMock = {
            go: function(userId, managerId) {
                return new Promise(function(resolve, reject) {
                    if(userId !== '12345' || managerId !== '98765') {
                        reject({
                            errorMessage: 'retrieve site error'
                        });
                    }
                    else {
                        resolve({successMessage: 'retrieve site success', data: {}});
                    }
                });
            }
        };

        deleteSiteMock = {
            go: function(managerId) {
                return new Promise(function(resolve, reject) {
                    if(managerId !== '12345') {
                        reject({
                            errorMessage: 'delete site error'
                        });
                    }
                    else {
                        resolve({successMessage: 'delete site success', data: {}});
                    }
                });
            }
        };

        editSiteMock = {
            go: function(managerId, username, password) {
                return new Promise(function(resolve, reject) {
                    if(managerId !== '12345' || username !== 'encryptedusername' || password !== 'encryptedpassword') {
                        reject({
                            errorMessage: 'edit site error'
                        });
                    }
                    else {
                        resolve({
                            successMessage: 'edit site success',
                            data: {}
                        });
                    }
                });
            }
        };



        mockery.registerMock('./db/mongoose-config.js', mongooseConfigMock);
        mockery.registerMock('./utils/login.js', loginMock);
        mockery.registerMock('./utils/email-verification.js', emailVerificationMock);
        mockery.registerMock('./utils/username-verification.js', usernameVerificationMock);
        mockery.registerMock('./utils/username-recovery.js', usernameRecoveryMock);
        mockery.registerMock('./utils/password-recovery.js', passwordRecoveryMock);
        mockery.registerMock('./utils/registration.js', registrationMock);
        mockery.registerMock('./utils/password-update.js', passwordUpdateMock);
        mockery.registerMock('./utils/add-site.js', addSiteMock);
        mockery.registerMock('./utils/site-list.js', siteListMock);
        mockery.registerMock('./utils/retrieve-site.js', retrieveSiteMock);
        mockery.registerMock('./utils/delete-site.js', deleteSiteMock);
        mockery.registerMock('./utils/edit-site.js', editSiteMock);

        index = require('./../app/index.js');
        app = index.app;

        done();

    });

    afterEach(function(done) {
        mockery.deregisterAll();
        mockery.disable();
        done();
    });

    it('On POST /login-test, on success should return an object with an _id property with a status 200...', function(done) {
        chai.request(app)
            .post('/login-test')
            .send({username: 'jonwade', password:  'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae'})
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('_id');
                res.body._id.should.be.a('string');
                done();
            });
    });

    it('On POST /login-test, on error should return an object with a errorMessage property with a status 404...', function(done){
        chai.request(app)
            .post('/login-test')
            .send({username: 'jonwad', password:  'e9cee71ab932fde863338d08be4de9dfe39ea049bdafb342ce659ec5450b69ae'})
            .end(function(err, res) {
                res.should.have.status(404);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('errorMessage');
                res.body.errorMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /email-verification, on success should return an object with a successMessage property with a status 200...', function(done){
        chai.request(app)
            .post('/email-verification')
            .send({email: '6929f4d0f691db9262bf7b7bed5aff6f425d52e212006e9ad2de9aec3b9bfd4e'})
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('successMessage');
                res.body.successMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /email-verification, on error should return an object with an errorMessage property with a status 404...', function(done){
        chai.request(app)
            .post('/email-verification')
            .send({email: '1239f4d0f691db9262bf7b7bed5aff6f425d52e212006e9ad2de9aec3b9bfd4e'})
            .end(function(err, res) {
                res.should.have.status(404);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('errorMessage');
                res.body.errorMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /username-verification, on success should return an object with a successMessage property with a status 200...', function(done){
        chai.request(app)
            .post('/username-verification')
            .send({username: 'jonwade'})
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('successMessage');
                res.body.successMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /username-verification, on error should return an object with an errorMessage property with a status 404...', function(done){
        chai.request(app)
            .post('/username-verification')
            .send({username: 'jonwad'})
            .end(function(err, res) {
                res.should.have.status(404);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('errorMessage');
                res.body.errorMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /username-recovery, on success should return return an object with a successMessage property with a status 200...', function(done) {
        chai.request(app)
            .post('/username-recovery')
            .send({_id : '57786733eeb287e63a404933', email: 'jonwadeuk@gmail.com'})
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('successMessage');
                res.body.successMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /username-recovery, on _id error should return an object with an errorMessage property with a status 404...', function(done) {
        chai.request(app)
            .post('/username-recovery')
            .send({_id : '12386733eeb287e63a404933', email: 'jonwadeuk@gmail.com'})
            .end(function(err, res) {
                res.should.have.status(404);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('errorMessage');
                res.body.errorMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /username-recovery, on email format failure should return an object with a errorMessage property with a status 404...', function(done) {

        chai.request(app)
            .post('/username-recovery')
            .send({_id: '5773272b231c75eb281e4460', email: 'jonwadeukgmail.com'})
            .end(function(err, res) {
                res.should.have.status(404);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('errorMessage');
                res.body.errorMessage.should.be.a('string');
                done();
            });

    });

    it('On POST /password-recovery, on success should return return an object with a successMessage property with a status 200...', function(done) {
        chai.request(app)
            .post('/password-recovery')
            .send({_id : '57786733eeb287e63a404933', email: 'jonwadeuk@gmail.com'})
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('successMessage');
                res.body.successMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /password-recovery, on _id error should return an object with an errorMessage property with a status 404...', function(done) {
        chai.request(app)
            .post('/password-recovery')
            .send({_id : '12386733eeb287e63a404933', email: 'jonwadeuk@gmail.com'})
            .end(function(err, res) {
                res.should.have.status(404);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('errorMessage');
                res.body.errorMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /password-recovery, on email format failure should return an object with a errorMessage property with a status 404...', function(done) {

        chai.request(app)
            .post('/password-recovery')
            .send({_id: '5773272b231c75eb281e4460', email: 'jonwadeukgmail.com'})
            .end(function(err, res) {
                res.should.have.status(404);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('errorMessage');
                res.body.errorMessage.should.be.a('string');
                done();
            });

    });

    it('On POST /create, on success should return an object with a data property with a status 200...', function(done) {
        chai.request(app)
            .post('/create')
            .send({username: 'testuser', email: 'testemail', password: 'testpassword'})
            .end(function(err, res) {
                //console.log('res=', res);
                should.equal(err, null);
                res.should.have.status(200);
                res.text.should.equal('1234');
                res.text.should.be.a('string');
                done();
            });
    });

    it('On POST /create, on error should return an object with an errorMessage property with a status 404...', function(done) {
        chai.request(app)
            .post('/create')
            .send({username: 'errorcase', email: 'testemail', password: 'testpassword'})
            .end(function(err, res) {
                err.should.have.status(404);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('errorMessage');
                res.body.errorMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /update-password, on success should return an object with a data property with a status 200...', function(done) {
        chai.request(app)
            .post('/update-password')
            .send({username: 'testuser', email: 'testemail', password: 'testpassword'})
            .end(function(err, res) {
                //console.log('res=', res);
                should.equal(err, null);
                res.should.have.status(200);
                res.text.should.equal('1234');
                res.text.should.be.a('string');
                done();
            });
    });

    it('On POST /update-password, on error should return an object with an errorMessage property with a status 404...', function(done) {
        chai.request(app)
            .post('/update-password')
            .send({username: 'errorcase', email: 'testemail', password: 'testpassword'})
            .end(function(err, res) {
                err.should.have.status(404);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('errorMessage');
                res.body.errorMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /add-site, on success should return return an object with a successMessage property with a status 200...', function(done) {
        chai.request(app)
            .post('/add-site')
            .send({userId: '12345', sitename : 'sitename', username: 'encryptedUsername', password: 'encryptedPassword'})
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('successMessage');
                res.body.successMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /add-site, on error should return return an object with a errorMessage property with a status 404...', function(done) {
        chai.request(app)
            .post('/add-site')
            .send({sitename : 'errorSitename', username: 'errorUsername', password: 'errorPassword'})
            .end(function(err, res) {
                res.should.have.status(404);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('errorMessage');
                res.body.errorMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /site-list, on success should return return an object with a successMessage property with a status 200...', function(done) {
        chai.request(app)
            .post('/site-list')
            .send({userId: '12345'})
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('successMessage');
                res.body.successMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /site-list, on error should return return an object with a errorMessage property with a status 404...', function(done) {
        chai.request(app)
            .post('/site-list')
            .send({userId: '54321'})
            .end(function(err, res) {
                res.should.have.status(404);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('errorMessage');
                res.body.errorMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /retrieve-site, on success should return return an object with a successMessage property with a status 200...', function(done) {
        chai.request(app)
            .post('/retrieve-site')
            .send({userId: '12345', managerId: '98765'})
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('successMessage');
                res.body.successMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /retrieve-site, on error should return return an object with a errorMessage property with a status 404...', function(done) {
        chai.request(app)
            .post('/retrieve-site')
            .send({userId: '54321', managerId: '98765'})
            .end(function(err, res) {
                res.should.have.status(404);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('errorMessage');
                res.body.errorMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /delete-site, on success should return return an object with a successMessage property with a status 200...', function(done) {
        chai.request(app)
            .post('/delete-site')
            .send({managerId: '12345'})
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('successMessage');
                res.body.successMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /delete-site, on error should return return an object with a errorMessage property with a status 404...', function(done) {
        chai.request(app)
            .post('/delete-site')
            .send({managerId: '54321'})
            .end(function(err, res) {
                res.should.have.status(404);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('errorMessage');
                res.body.errorMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /edit-site, on success should return return an object with a successMessage property with a status 200...', function(done) {
        chai.request(app)
            .post('/edit-site')
            .send({_id: '12345', username: 'encryptedusername', password: 'encryptedpassword'})
            .end(function(err, res) {
                should.equal(err, null);
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('successMessage');
                res.body.successMessage.should.be.a('string');
                done();
            });
    });

    it('On POST /edit-site, on error should return return an object with a errorMessage property with a status 404...', function(done) {
        chai.request(app)
            .post('/delete-site')
            .send({managerId: '54321', username: 'encryptedusername', password: 'encryptedpassword'})
            .end(function(err, res) {
                res.should.have.status(404);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.have.property('errorMessage');
                res.body.errorMessage.should.be.a('string');
                done();
            });
    });



    it('On GET /, should return the home page with a status 200, include a head tag and res.notFound should be false', function(done){
        chai.request(app)
            .get('/')
            .end(function(err, res) {
                res.should.have.status(200);
                res.text.should.include('<head>');
                res.notFound.should.equal(false);
                done();
            });
    });

    it('On GET page that does not exist, should return the home page, with a status 200, include a head tag and res.notFound should be false', function(done){
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

describe('database.js unit test', function() {

    var schema, db;
    beforeEach(function(done) {
        mockery.enable({
            useCleanCache: true,
            warnOnUnregistered: false
        });

        schema = {
            remove: function(data, callback) {
                if (data === 'non existent user') {
                    callback(false, {
                        result: {
                            ok: 1,
                            n: 0
                        }
                    });
                }
                else if(data === 'existing user') {
                    callback(false, {
                        result: {
                            ok: 1,
                            n: 1
                        }
                    });
                }
                else {
                    callback({
                        errorMessage: 'delete function error'
                    });
                }
            },
            create: function(data, callback) {
                if (data === 'testuser') {
                    callback(false, {})
                }
                else {
                    callback({errorMessage: 'create function error'});
                }

            },
            findOneAndUpdate: function(data, content, callback) {
                if (data === 'existing user') {
                    callback(false, {});
                }
                else {
                    callback({errorMessage: 'update function error'})
                }

            },
            find: function(data, fields, callback) {
                if (data === 'existing user') {
                    callback(false, [{_id: ''}]);
                }
                else if (data !== 'errorcase') {
                    callback(false, []);
                }
                else {
                    callback({errorMessage: 'read function error'});
                }
            }
        };

        db = require('./../app/db/database.js');

        done();

    });

    afterEach(function(done) {
        mockery.deregisterAll();
        mockery.disable();
        done();
    });

    it('should return "n" as zero when you try to delete a user that does not exist', function(done) {
        db.controller.delete('non existent user', schema)
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

    it('should successfully delete an existing user, returning "n" as 1...', function(done) {
        db.controller.delete('existing user', schema)
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

    it('should throw an error if there was a problem with the deletion function...', function(done) {
        db.controller.delete('errorcase', schema)
            .then(function(res) {
                //no test here as checking error return
            }, function(rej) {
                rej.should.be.a('object');
                rej.should.have.property('errorMessage');
                done();
            });
    });

    it('should successfully create a new user in the database...', function(done) {
        db.controller.create('testuser', schema)
            .then(function(res) {
                res.should.be.a('object');
                done();
            }, function(rej) {
                //no test here
            });
    });

    it('should throw an error if there was a problem with the creation function...', function(done) {
        db.controller.create('errorcase', schema)
            .then(function(res) {
                //no test here as checking error return
            }, function(rej) {
                rej.should.be.a('object');
                rej.should.have.property('errorMessage');
                done();
            });
    });

    it('should successfully update an existing user...', function(done) {
        db.controller.update('existing user', {}, schema)
            .then(function(res) {
                res.should.be.a('object');
                done();
            }, function(rej) {
                //no test here
            });
    });

    it('should throw an error if there was a problem with the update function...', function(done) {
        db.controller.update('errorcase', {}, schema)
            .then(function(res) {
                //no test here as checking error return
            }, function(rej) {
                rej.should.be.a('object');
                rej.should.have.property('errorMessage');
                done();
            });
    });

    it('should successfully read the database and find an existing user returning all fields associated with that user...', function(done) {
        db.controller.read('existing user', 'test fields', schema)
            .then(function(res) {
                res.should.be.a('array');
                res[0].should.have.property('_id');
                done();
            }, function(rej) {
                //no test here
            });
        });


    it('when searching for a user that does not exist, should successfully respond with empty array ...', function(done) {
        db.controller.read('non existent user', 'test fields', schema)
            .then(function(res) {
                res.should.be.a('array');
                res.length.should.equal(0);
                done();
            }, function(rej) {
                //no test here
            });

    });

    it('should throw an error if there was a problem with the read function...', function(done) {
        db.controller.read('errorcase', 'test fields', schema)
            .then(function(res) {
                //no test here as checking error return
            }, function(rej) {
                rej.should.be.a('object');
                rej.should.have.property('errorMessage');
                done();
            });
    });

});

describe('mongoose-config.js unit test', function() {

    var mongooseConfig = require('./../app/db/mongoose-config.js')

    it('should return an object from mongooseConfig.userTest with a method called schema...', function(done) {
        var testObject = mongooseConfig.userTest();

        testObject.should.be.a('object');
        testObject.should.have.property('schema');
        done();

    });

    it('should return an object from mongooseConfig.userDev with a method called schema...', function(done) {
        var testObject = mongooseConfig.userDev();

        testObject.should.be.a('object');
        testObject.should.have.property('schema');
        done();

    });

    it('should return an object from mongooseConfig.managerTest with a method called schema...', function(done) {
        var testObject = mongooseConfig.managerTest();

        testObject.should.be.a('object');
        testObject.should.have.property('schema');
        done();

    });

    it('should return an object from mongooseConfig.managerDev with a method called schema...', function(done) {
        var testObject = mongooseConfig.managerDev();

        testObject.should.be.a('object');
        testObject.should.have.property('schema');
        done();

    });

});



