var chai = require('chai');
var unit = require('./../app/utils/mailer.js');

var should = chai.should();


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