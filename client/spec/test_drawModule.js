var drawModule = require('../js/drawModule.js');
var utils = require('../js/utils.js');
var chai = require('chai');
var assert = require('chai').assert;

var jsdom = require("jsdom").jsdom;
require('mocha-jsdom');

chai.should();

var time1 = "2015-11-05T06:25:56.577Z" ;

var time2 = "2015-11-06T21:57:22.604Z";

var reviewsJSON = [
  {
    "@context": "http://schema.org",
    "@type": "Review",
    "author":{
      "@type": "Person",
      "name": "user1"
    },
    "dateCreated": "2016-06-08T11:43:54.008Z",
    "itemReviewed":{
      "@type": "Restaurant",
      "name": "Armentegi"
    },
    "name": "542e8baee4bbdc539487eb6d53636e99ad8e0126",
    "publisher":{
      "@type": "Organization",
      "name": "Bitergia"
    },
    "reviewBody": "Body review22225555",
    "reviewRating":{
      "@type": "Rating",
      "ratingValue": 4
    }
  },
  {
    "@context": "http://schema.org",
    "@type": "Review",
    "author":{
      "@type": "Person",
      "name": "user1"
    },
    "dateCreated": "2016-06-08T11:43:54.009Z",
    "itemReviewed":{
        "@type": "Restaurant",
        "name": "Biltoki"
    },
    "name": "66f0b52ab5be9e2d25cf72707e8b1ec0dad2eff1",
    "publisher":{
      "@type": "Organization",
      "name": "Bitergia"
    },
    "reviewBody": "Body review",
    "reviewRating":{
      "@type": "Rating",
      "ratingValue": 5
    }
  }
];


var reservationsJSON = [
  {
    "@context": "http://schema.org",
    "@type": "FoodEstablishmentReservation",
    "partySize": 19,
    "reservationFor":{
    "@type": "FoodEstablishment",
    "name": "Mitarte",
    "address":{
      "@type": "PostalAddress",
      "streetAddress": "De La Rioja Hiribidea 7",
      "addressRegion": "Araba",
      "addressLocality": "Labastida",
      "postalCode": "01330"
    }
  },
    "reservationId": "ec743b4c9b46578d48f62201187020397f88037c",
    "reservationStatus": "Hold",
    "startTime": time1,
    "underName":{
      "@type": "Person",
      "name": "user1"
    }
  },
  {
    "@context": "http://schema.org",
    "@type": "FoodEstablishmentReservation",
    "partySize": 8,
    "reservationFor":{
      "@type": "FoodEstablishment",
      "name": "El Medoc Alavés",
      "address":{
        "@type": "PostalAddress",
        "streetAddress": "San Raimundo Hiribidea 15",
        "addressRegion": "Araba",
        "addressLocality": "Guardia",
        "postalCode": "01300"
      }
    },
    "reservationId": "1212bc7fff8c7fb8bf3848f839e1dc810cf4911e",
    "reservationStatus": "Pending",
    "startTime": time2,
    "underName":{
      "@type": "Person",
      "name": "user1"
    }
  }
];


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

      var doc = jsdom("<html><head></head>"+
          "<body>"+
            "<div class='container-fluid'>"+
              "<div id='popTitle'></div>" +
            "</div>"+
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
      

      var doc = jsdom("<html><head></head>"+
          "<body>"+
            "<div class='container-fluid'>"+
              "<div id='popContent'></div>" +
            "</div>"+
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

      var doc = jsdom("<html><head></head>"+
          "<body>"+
            "<div class='container-fluid'>"+
            "</div>"+
            "</body></html>", {});
      
      global.window = doc.defaultView;
      global.document = window.document;
      global.navigator = {
            userAgent: 'nodejs'
          }


      var expectedDiv = document.createElement('DIV');
      expectedDiv.className = 'reviewList';

      var review1 = document.createElement('DIV');
      review1.className = 'reviewElement';

      var top1 = document.createElement('DIV');
      top1.className = 'review-top';

      var rating1 = document.createElement('DIV');
      rating1.className = 'rating-div';

      var ratLab1 = document.createElement('span');
      ratLab1.className = 'ratingLabel';
      ratLab1.textContent = 'Rating: ';

      var ratVal1 = document.createElement('span');
      ratVal1.className = 'ratingValue';
      ratVal1.textContent = '4';

      rating1.appendChild(ratLab1);
      rating1.appendChild(ratVal1);

      var author1 = document.createElement('DIV');
      author1.className = 'author-div';

      var authLab1 = document.createElement('SPAN');
      authLab1.className = 'authorLabel';
      authLab1.textContent = 'Author: ';

      var authVal1 = document.createElement('SPAN');
      authVal1.className = 'authorValue';
      authVal1.textContent = 'user1';

      author1.appendChild(authLab1);
      author1.appendChild(authVal1);

      top1.appendChild(rating1);
      top1.appendChild(author1);



      var body1 = document.createElement('DIV');
      body1.className = 'reviewBodyDiv';

      var bodyLab1 = document.createElement('SPAN');
      bodyLab1.className = 'bodyLabel';

      var bodyVal1 =  document.createElement('SPAN');
      bodyVal1.className = 'bodyValue';
      bodyVal1.textContent = 'Body review22225555';

      body1.appendChild(bodyLab1);
      body1.appendChild(bodyVal1);

      review1.appendChild(top1);
      review1.appendChild(document.createElement('HR'));
      review1.appendChild(body1);

      expectedDiv.appendChild(review1);

      var review2 = document.createElement('DIV');
      review2.className = 'reviewElement';

      var top2 = document.createElement('DIV');
      top2.className = 'review-top';

      var rating2 = document.createElement('DIV');
      rating2.className = 'rating-div';

      var ratLab2 = document.createElement('span');
      ratLab2.className = 'ratingLabel';
      ratLab2.textContent = 'Rating: ';

      var ratVal2 = document.createElement('span');
      ratVal2.className = 'ratingValue';
      ratVal2.textContent = '5';

      rating2.appendChild(ratLab2);
      rating2.appendChild(ratVal2);

      var author2 = document.createElement('DIV');
      author2.className = 'author-div';

      var authLab2 = document.createElement('SPAN');
      authLab2.className = 'authorLabel';
      authLab2.textContent = 'Author: ';

      var authVal2 = document.createElement('SPAN');
      authVal2.className = 'authorValue';
      authVal2.textContent = 'user1';

      author2.appendChild(authLab2);
      author2.appendChild(authVal2);

      top2.appendChild(rating2);
      top2.appendChild(author2);



      var body2 = document.createElement('DIV');
      body2.className = 'reviewBodyDiv';

      var bodyLab2 = document.createElement('SPAN');
      bodyLab2.className = 'bodyLabel';

      var bodyVal2 =  document.createElement('SPAN');
      bodyVal2.className = 'bodyValue';
      bodyVal2.textContent = 'Body review';

      body2.appendChild(bodyLab2);
      body2.appendChild(bodyVal2);

      review2.appendChild(top2);
      review2.appendChild(document.createElement('HR'));
      review2.appendChild(body2);

      expectedDiv.appendChild(review2);


      var reviewsResponse = JSON.stringify(reviewsJSON)
      var testDiv = drawModule.createReviewsDiv(reviewsResponse);

      expect(testDiv.innerHTML).to.be.deep.equal(expectedDiv.innerHTML);

    })


    it('Test create reservations div', function() {
      

      var doc = jsdom("<html><head></head>"+
          "<body>"+
            "<div class='container-fluid'>"+
            "</div>"+
            "</body></html>", {});
      
      global.window = doc.defaultView;
      global.document = window.document;
      global.navigator = {
            userAgent: 'nodejs'
          }


      var expectedDiv = document.createElement('DIV');
      expectedDiv.className = 'table table-fixed table-hover';

      var thead = document.createElement('THEAD');

      var headRow = document.createElement('TR');
      headRow.className = 'row';

      var th1 = document.createElement('TH');
      th1.className = 'col-xs-6';
      th1.textContent = 'Reserved by:';
      var th2 = document.createElement('TH');
      th2.className = 'col-xs-4';
      th2.textContent = 'Reservation time:';
      var th3 = document.createElement('TH');
      th3.className = 'col-xs-2';
      th3.textContent = 'Diners:';

      headRow.appendChild(th1);
      headRow.appendChild(th2);
      headRow.appendChild(th3);

      thead.appendChild(headRow);

      var tbody = document.createElement('TBODY');

      var bodyRow1 = document.createElement('TR');

      var td11 = document.createElement('TD');
      td11.className = 'col-xs-6';
      td11.textContent = 'user1';

      var td12 = document.createElement('TD');
      td12.className = 'col-xs-4';
      td12.textContent =  utils.fixBookingTime(time1);

      var td13 = document.createElement('TD');
      td13.className = 'col-xs-2';
      td13.textContent = '19';

      bodyRow1.appendChild(td11);      
      bodyRow1.appendChild(td12);
      bodyRow1.appendChild(td13);

      tbody.appendChild(bodyRow1);

      var bodyRow2 = document.createElement('TR');

      var td21 = document.createElement('TD');
      td21.className = 'col-xs-6';
      td21.textContent = 'user1';

      var td22 = document.createElement('TD');
      td22.className = 'col-xs-4';
      td22.textContent =  utils.fixBookingTime(time2);

      var td23 = document.createElement('TD');
      td23.className = 'col-xs-2';
      td23.textContent = '8';

      bodyRow2.appendChild(td21);      
      bodyRow2.appendChild(td22);
      bodyRow2.appendChild(td23);

      tbody.appendChild(bodyRow2);

      expectedDiv.appendChild(thead);
      expectedDiv.appendChild(tbody);


      var reservationsResponse = JSON.stringify(reservationsJSON);
      var testDiv = drawModule.createReservationsDiv(reservationsResponse);
      expect(testDiv.innerHTML).to.be.deep.equal(expectedDiv.innerHTML);
    })

    it('Test create reservations table', function() {

     var doc = jsdom("<html><head></head>"+
          "<body>"+
            "<div class='container-fluid'>"+
            "<table>" +
              "<tbody id ='reservationsTableBody'></tbody>" +
            "</div>"+
            "</body></html>", {});
      
      global.window = doc.defaultView;
      global.document = window.document;
      global.navigator = {
            userAgent: 'nodejs'
          }


      var expectedEle = document.createElement('TBODY');

      var tr1 = document.createElement('TR');

      var res1 = document.createElement('TD');
      res1.textContent = 'Mitarte';

      var date1 = document.createElement('TD');
      date1.textContent = utils.fixBookingTime(time1);

      var diners1 = document.createElement('TD');
      diners1.textContent = '19';

      var cancel1 = document.createElement('TD');
      var link1 = document.createElement('A');
      link1.textContent = 'Cancel reservation';

      cancel1.appendChild(link1);

      tr1.appendChild(res1);
      tr1.appendChild(date1);
      tr1.appendChild(diners1);
      tr1.appendChild(cancel1);

      expectedEle.appendChild(tr1);

      var tr2 = document.createElement('TR');

      var res2 = document.createElement('TD');
      res2.textContent = 'El Medoc Alavés';

      var date2 = document.createElement('TD');
      date2.textContent = utils.fixBookingTime(time2);

      var diners2 = document.createElement('TD');
      diners2.textContent = '8';

      var cancel2 = document.createElement('TD');
      var link2 = document.createElement('A');
      link2.textContent = 'Cancel reservation';

      cancel2.appendChild(link2);

      tr2.appendChild(res2);
      tr2.appendChild(date2);
      tr2.appendChild(diners2);
      tr2.appendChild(cancel2);

      expectedEle.appendChild(tr2);

      var reservationsResponse = JSON.stringify(reservationsJSON);
      drawModule.createReservationsTable(reservationsResponse);

     expect(document.getElementById('reservationsTableBody').innerHTML).to.be.deep.equal(expectedEle.innerHTML);

    })
   

 it('Test create reviews table', function() {

    var doc = jsdom("<html><head></head>"+
          "<body>"+
            "<div class='container-fluid'>"+
            "<table>" +
              "<tbody id ='reviewsTableBody'></tbody>" +
            "</div>"+
            "</body></html>", {});
      
      global.window = doc.defaultView;
      global.document = window.document;
      global.navigator = {
            userAgent: 'nodejs'
          }


    var expectedEle = document.createElement('TBODY');

    var tr1 = document.createElement('TR');

    var res1 = document.createElement('TD');
    res1.className = 'col-xs-4';
    res1.textContent = 'Armentegi';

    var rat1 = document.createElement('TD');
    rat1.className = 'col-xs-2';
    rat1.textContent = '4';

    var viewTd1 = document.createElement('TD');
    viewTd1.className = 'col-xs-2';

    var viewLink1 = document.createElement('A');
    viewLink1.textContent = 'View review'
    viewTd1.appendChild(viewLink1);
    
    var editTd1 = document.createElement('TD');
    editTd1.className = 'col-xs-2';

    var editLink1 = document.createElement('A');
    editLink1.textContent = 'Edit review';
    editTd1.appendChild(editLink1);   
    
    var deleteTd1 = document.createElement('TD');
    deleteTd1.className = 'col-xs-2';

    var deleteLink1 = document.createElement('A');
    deleteLink1.textContent = 'Delete review';
    deleteTd1.appendChild(deleteLink1);

    tr1.appendChild(res1);
    tr1.appendChild(rat1);
    tr1.appendChild(viewTd1);
    tr1.appendChild(editTd1);
    tr1.appendChild(deleteTd1);

    expectedEle.appendChild(tr1);


    var tr2 = document.createElement('TR');

    var res2 = document.createElement('TD');
    res2.className = 'col-xs-4';
    res2.textContent = 'Biltoki';

    var rat2 = document.createElement('TD');
    rat2.className = 'col-xs-2';
    rat2.textContent = '5';

    var viewTd2 = document.createElement('TD');
    viewTd2.className = 'col-xs-2';

    var viewLink2 = document.createElement('A');
    viewLink2.textContent = 'View review'
    viewTd2.appendChild(viewLink2);
    
    var editTd2 = document.createElement('TD');
    editTd2.className = 'col-xs-2';

    var editLink2 = document.createElement('A');
    editLink2.textContent = 'Edit review';
    editTd2.appendChild(editLink2);   
    
    var deleteTd2 = document.createElement('TD');
    deleteTd2.className = 'col-xs-2';

    var deleteLink2 = document.createElement('A');
    deleteLink2.textContent = 'Delete review';
    deleteTd2.appendChild(deleteLink2);

    tr2.appendChild(res2);
    tr2.appendChild(rat2);
    tr2.appendChild(viewTd2);
    tr2.appendChild(editTd2);
    tr2.appendChild(deleteTd2);

    expectedEle.appendChild(tr2);



    var reviewsResponse = JSON.stringify(reviewsJSON);
    drawModule.createReviewsTable(reviewsResponse);
    expect(document.getElementById('reviewsTableBody').innerHTML).to.be.deep.equal(expectedEle.innerHTML);
 })


  it('Create review form (new)', function() {

     var doc = jsdom("<html><head></head>"+
          "<body>"+
            "<div class='container-fluid'>"+
            "</div>"+
            "</body></html>", {});
      
      global.window = doc.defaultView;
      global.document = window.document;
      global.navigator = {
            userAgent: 'nodejs'
          }


      var expectedForm = document.createElement('DIV');
      expectedForm.className = 'editReviewForm';
      expectedForm.name = 'editReviewForm';

      var iniLab = document.createElement('LABEL');
      iniLab.textContent = 'Your review: ';
      expectedForm.appendChild(iniLab);

      expectedForm.appendChild(document.createElement('BR'));

      var textArea = document.createElement('TEXTAREA');
      textArea.name = 'reviewBody';
      expectedForm.appendChild(textArea);

      expectedForm.appendChild(document.createElement('BR'));

      var ratLab = document.createElement('LABEL');
      ratLab.textContent = 'Rating value: ';
      expectedForm.appendChild(ratLab);

      var select = document.createElement('SELECT');
      select.name = 'ratingValue';

      for (var i = 0 ; i <=5; i++) {
        var option = document.createElement('OPTION');
        option.value = i;
        option.textContent = i + ' Star' + (1 != i ? 's' : '');
        select.appendChild(option);
      };

      expectedForm.appendChild(select);

      var input = document.createElement('INPUT');
      input.type = 'submit';
      input.value = 'Create Review';
      input.name = 'submitReview';

      expectedForm.appendChild(input);

      var testForm = drawModule.createReviewForm('Restaurant1');

      expect(testForm.innerHTML).to.be.deep.equal(expectedForm.innerHTML);

  })


  it('Create review form (update)', function() {

     var doc = jsdom("<html><head></head>"+
          "<body>"+
            "<div class='container-fluid'>"+
            "</div>"+
            "</body></html>", {});
      
      global.window = doc.defaultView;
      global.document = window.document;
      global.navigator = {
            userAgent: 'nodejs'
          }

      var singleReviewJSON = reviewsJSON[0];
      var singleReview = JSON.stringify(singleReview);

      var expectedForm = document.createElement('DIV');
      expectedForm.className = 'editReviewForm';
      expectedForm.name = 'editReviewForm';

      var iniLab = document.createElement('LABEL');
      iniLab.textContent = 'Your review: ';
      expectedForm.appendChild(iniLab);

      expectedForm.appendChild(document.createElement('BR'));

      var textArea = document.createElement('TEXTAREA');
      textArea.name = 'reviewBody';
      textArea.value = singleReviewJSON.reviewBody;

      expectedForm.appendChild(textArea);

      expectedForm.appendChild(document.createElement('BR'));

      var ratLab = document.createElement('LABEL');
      ratLab.textContent = 'Rating value: ';
      expectedForm.appendChild(ratLab);

      var select = document.createElement('SELECT');
      select.name = 'ratingValue';

      for (var i = 0 ; i <=5; i++) {
        var option = document.createElement('OPTION');
        option.value = i;
        option.textContent = i + ' Star' + (1 != i ? 's' : '');
        select.appendChild(option);
      };

      expectedForm.appendChild(select);

      var input = document.createElement('INPUT');
      input.type = 'submit';
      input.value = 'Create Review';
      input.name = 'submitReview';

      expectedForm.appendChild(input);

      var testForm = drawModule.createReviewForm('Restaurant1', singleReview);

      expect(testForm.innerHTML).to.be.deep.equal(expectedForm.innerHTML);

      document.getElementsByClassName('container-fluid')[0].appendChild(testForm);

      //hacked because it fails using JSDOM
      document.forms.namedItem = function (name) {
        return document.forms[0];
      }

      drawModule.inicializeReviewForm(singleReviewJSON);
      expect(document.getElementsByName('reviewBody')[0].value).to.be.equal(singleReviewJSON.reviewBody);
      expect(document.getElementsByName('ratingValue')[0].value).to.be.equal(singleReviewJSON.reviewRating.ratingValue+'');

  })


})