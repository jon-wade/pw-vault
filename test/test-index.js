var chai = require('chai');
var chaiHttp = require('chai-http');
var index = require('../app/index.js');

var app = index.app;
var should = chai.should();

chai.use(chaiHttp);

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