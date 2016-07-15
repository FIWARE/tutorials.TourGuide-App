var utils = require('../js/utils.js')
var jsdom = require("jsdom").jsdom;
require('mocha-jsdom')

describe('Testing utils module', function () {

  describe('Testing showMessage function', function() {

    beforeEach(function() {
      var doc = jsdom("<div class='container-fluid'>" +
          "<div id='topMenu'></div>" +
          "<div id='sibling1'></div>" +
        "</div>", {});
      global.window = doc.defaultView;
      global.document = window.document;
    });

    afterEach(function() {
      while (window.firstChild) {
        window.removeChild(myNode.firstChild);
      }
      delete global.window;
      delete global.document;
    })

    it('Test alert-danger message', function() {
      var message = 'test 1';
      utils.showMessage(message, 'alert-danger');

      var navBar = document.getElementById('topMenu');
      var messageDiv = navBar.nextSibling;
      
      expect(messageDiv).to.have.property('className').that.is.a('string')
        .to.contain('alert').to.contain('fade').to.contain('in')
        .to.contain('alert-danger');
      expect(messageDiv).to.have.property('textContent').that.is.a('string')
        .to.be.equal(message + 'X');
    })

    it('Test alert-warning message', function() {
      var message = 'test 2';
      utils.showMessage(message, 'alert-warning');

      var navBar = document.getElementById('topMenu');
      var messageDiv = navBar.nextSibling;

      expect(messageDiv).to.have.property('className').that.is.a('string')
        .to.contain('alert').to.contain('fade').to.contain('in')
        .to.contain('alert-warning');
      expect(messageDiv).to.have.property('textContent').that.is.a('string')
        .to.be.equal(message + 'X');
    })

    it('Test default message', function() {
      var message = 'test 3';
      utils.showMessage(message);

      var navBar = document.getElementById('topMenu');
      var messageDiv = navBar.nextSibling;

      expect(messageDiv).to.have.property('className').that.is.a('string')
        .to.contain('alert').to.contain('fade').to.contain('in')
        .to.contain('alert-warning');
      expect(messageDiv).to.have.property('textContent').that.is.a('string')
        .to.be.equal(message + 'X');
    })
  })
});
  