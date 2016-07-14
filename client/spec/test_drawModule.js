var drawModule = require('../js/drawModule.js');
var utils = require('../js/utils.js');
var chai = require('chai');
var assert = require('chai').assert;
var fs = require('fs');

var jsdom = require("jsdom").jsdom;
require('mocha-jsdom');
require('./helpers/data.js');
chai.should();

var basePath = __dirname+'/html_fragments/';
describe('Testing drawModule', function () {
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

  it('Test set popup title', function() {  
    var title = 'Test title';
    var doc = jsdom("<html><head></head>" +
        "<body>" +
          "<div class='container-fluid'>" +
            "<div id='popTitle'></div>" +
          "</div>" +
        "</body></html>", {});
    
    global.window = doc.defaultView;
    global.document = window.document;
    global.navigator = {
      userAgent: 'nodejs'
    }

    drawModule.setPopupTitle(title);
    expect(document.getElementById('popTitle').textContent).to.be.equal(title);
  })

  it('Test set popup content', function() {
    var doc = jsdom("<html><head></head>" +
        "<body>" +
          "<div class='container-fluid'>" +
            "<div id='popContent'></div>" +
          "</div>" +
        "</body></html>", {});
    
    global.window = doc.defaultView;
    global.document = window.document;
    global.navigator = {
      userAgent: 'nodejs'
    }

    var nDiv = document.createElement('DIV');
    nDiv.id = 'testDiv';
    var nP = document.createElement('P');
    nP.textContent = 'Test text';

    nDiv.appendChild(nP);

    drawModule.setPopupContent(nDiv);
    expect(document.getElementById('popContent').children[0]).to.be.deep.equal(nDiv);
  })

  it('Test create reviews div', function () {
    var doc = jsdom({});
    
    global.window = doc.defaultView;
    global.document = window.document;
    global.navigator = {
      userAgent: 'nodejs'
    }

    var html = fs.readFileSync(basePath + 'reviews_div.html');
    var expectedDiv = jsdom(html);

    var reviewsResponse = JSON.stringify(reviewsJSON)
    var testDiv = drawModule.createReviewsDiv(reviewsResponse);

    expect(testDiv.innerHTML).to.be.equal(
      expectedDiv.defaultView.document.body.innerHTML);
  })

  it('Test create reservations div', function() {
    var doc = jsdom({});
    
    global.window = doc.defaultView;
    global.document = window.document;
    global.navigator = {
      userAgent: 'nodejs'
    }

    var html = fs.readFileSync(basePath + 'reservations_div.html');
    var expectedDiv = jsdom(html);

    var reservationsResponse = JSON.stringify(reservationsJSON);
    var testDiv = drawModule.createReservationsDiv(reservationsResponse);
    expect(testDiv.innerHTML).to.be.equal(
      expectedDiv.defaultView.document.getElementById('testTable').innerHTML);
  })

  it('Test create reservations table', function() {
    var doc = jsdom("<html><head></head>" +
        "<body>" +
          "<div class='container-fluid'>" +
            "<table>" +
              "<tbody id ='reservationsTableBody'></tbody>" +
            "</table>" +
          "</div>" +
        "</body></html>", {});
    
    global.window = doc.defaultView;
    global.document = window.document;
    global.navigator = {
      userAgent: 'nodejs'
    }

    var html = fs.readFileSync(basePath + 'reservations_table.html');
    var expectedEle = jsdom(html);

    var reservationsResponse = JSON.stringify(reservationsJSON);
    drawModule.createReservationsTable(reservationsResponse);

    expect(document.getElementById('reservationsTableBody').innerHTML).to.be.deep
    .equal(expectedEle.defaultView.document.getElementById('testBody').innerHTML);
  })
 
  it('Test create reviews table', function() {
    var doc = jsdom("<html><head></head>" +
        "<body>" +
          "<div class='container-fluid'>" +
            "<table>" +
              "<tbody id ='reviewsTableBody'></tbody>" +
            "</table>" +
          "</div>" +
        "</body></html>", {});
        
    global.window = doc.defaultView;
    global.document = window.document;
    global.navigator = {
      userAgent: 'nodejs'
    }

    var html = fs.readFileSync(basePath + 'reviews_table.html');
    var expectedEle = jsdom(html);
      
    var reviewsResponse = JSON.stringify(reviewsJSON);
    drawModule.createReviewsTable(reviewsResponse);
    expect(document.getElementById('reviewsTableBody').innerHTML).to.be.deep.equal(
      expectedEle.defaultView.document.getElementById('reviewsTableBody').innerHTML);
  })

  it('Create review form (new)', function() {
    var doc = jsdom({});
      
    global.window = doc.defaultView;
    global.document = window.document;
    global.navigator = {
      userAgent: 'nodejs'
    }

    var html = fs.readFileSync(basePath + 'new_review_form.html');
    var expectedForm = jsdom(html);
    var testForm = drawModule.createReviewForm('Restaurant1');

    expect(testForm.innerHTML).to.be.deep.equal(
      expectedForm.defaultView.document.getElementById('testForm').innerHTML);
  })

  it('Create review form (update)', function() {
    var doc = jsdom("<html><head></head>" +
        "<body>" +
          "<div class='container-fluid'>" +
          "</div>" +
        "</body></html>", {});
    
    global.window = doc.defaultView;
    global.document = window.document;
    global.navigator = {
      userAgent: 'nodejs'
    }
 
    var singleReviewJSON = reviewsJSON[0];
    var singleReview = JSON.stringify(singleReview);

    var html = fs.readFileSync(basePath + 'new_review_form.html');
    var expectedForm = jsdom(html);

    var testForm = drawModule.createReviewForm('Restaurant1', singleReview);

    expect(testForm.innerHTML).to.be.deep.equal(
      expectedForm.defaultView.document.getElementById('testForm').innerHTML);

    document.getElementsByClassName('container-fluid')[0].appendChild(testForm);

    // hacked because it fails using JSDOM
    document.forms.namedItem = function (name) {
      return document.forms[0];
    }

    drawModule.initializeReviewForm(singleReviewJSON);
    expect(document.getElementsByName('reviewBody')[0].value).to.be.equal(singleReviewJSON.reviewBody);
    expect(document.getElementsByName('ratingValue')[0].value).to.be.equal(singleReviewJSON.reviewRating.ratingValue+'');
  })
})
