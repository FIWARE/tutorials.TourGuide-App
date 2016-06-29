var AJAXRequest = require('../js/AJAXRequest.js')
var chai = require('chai');
var assert = require('chai').assert;

chai.should();

describe('Testing AJAXRequest', function () {
  before(function() {
    global.XMLHttpRequest = sinon.useFakeXMLHttpRequest();
  })

  after(function() {
    delete global.XMLHttpRequest;
  })

  beforeEach(function() {
    this.xhr = sinon.useFakeXMLHttpRequest();

    this.requests = [];
    this.xhr.onCreate = function(xhr) {
      this.requests.push(xhr);
    }.bind(this);
  });

  afterEach(function() {
    this.xhr.restore();
  });


    it('GET. Should execute success function', function(done) {
      var data = { foo: 'bar' };
      var dataJson = JSON.stringify(data);

      AJAXRequest.get('http://example.com',function(result) {
        assert(true, 'Success function called');
        done();
      },

      function(fail){
        assert(false, 'Unexpected response');
        done();
      });

      this.requests[0].respond(200,{},"");
    });


    it('GET. Should parse fetched data as JSON', function(done) {
      var data = { foo: 'bar' };
      var dataJson = JSON.stringify(data);

      AJAXRequest.get('http://example.com',function(result) {
        JSON.parse(result).should.deep.equal(data);
        done();
      },

      function(fail){
        assert(false, 'Unexpected response');
        done();
      });

      this.requests[0].respond(200, { 'Content-Type': 'text/json' }, dataJson);
    });


    it('POST. Should send given data as JSON body', function() {
      var data = { hello: 'world' };
      var dataJson = JSON.stringify(data);

      AJAXRequest.post('http://example.com', function(){
          assert(true, 'Success function called');
        }, 
        function(){
          assert(false, 'Error function called');
        }, data);
        this.requests[0].requestBody.should.equal(dataJson);
    });


    it('PATCH. Should send given data as JSON body', function() {
      var data = { hello: 'world' };
      var dataJson = JSON.stringify(data);

      AJAXRequest.patch('http://example.com', function(){
          assert(true, 'Success function called');
        }, 
        function(){
          assert(false, 'Error function called');
        }, data);
        this.requests[0].requestBody.should.equal(dataJson);
    });


})