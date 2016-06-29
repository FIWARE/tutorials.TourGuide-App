var restaurantsAPI = require('../js/restaurantsAPI.js')
var chai = require('chai');
var assert = require('chai').assert;

chai.should();


var restaurantsJSON = [{
      "@context": "http://schema.org",
      "@type": "Restaurant1",
      "additionalProperty":[
        {
          "value": 10,
          "name": "capacity",
          "@type": "PropertyValue"
        },
        {
          "value": 1,
          "name": "occupancyLevels",
          "@type": "PropertyValue",
          "timestamp": "2016-05-31T06:52:18.169Z"
        }
      ],
      "address":{
        "streetAddress": "Street 1",
        "addressRegion": "Region 1",
        "addressLocality": "Locality 1",
        "postalCode": "11111",
        "@type": "PostalAddress"
      },
      "aggregateRating":{
        "reviewCount": 1,
        "ratingValue": 1
      },
      "department": "Franchise1",
      "description": "Restaurant description 1",
      "geo":{
      "@type": "GeoCoordinates",
      "latitude": "42.8404625",
      "longitude": "-2.5123277"
    },
    "name": "Retaurant1",
    "priceRange": 1,
    "telephone": "111 111 111"
  },
  {
    "@context": "http://schema.org",
    "@type": "Restaurant",
    "additionalProperty":[
      {
        "value": 20,
        "name": "capacity",
        "@type": "PropertyValue"
      },
      {
        "value": 2,
        "name": "occupancyLevels",
        "@type": "PropertyValue",
        "timestamp": "2016-05-31T06:52:18.169Z"
      }
    ],
    "address":{
      "streetAddress": "Street 2",
      "addressRegion": "Region 2",
      "addressLocality": "Locality 2",
      "postalCode": "22222",
      "@type": "PostalAddress"
    },
    "aggregateRating":{
      "reviewCount": 2,
      "ratingValue": 2
    },
    "department": "Franchise2",
    "description": "Restaurant description 2",
    "geo":{
      "@type": "GeoCoordinates",
      "latitude": "42.8538811",
      "longitude": "-2.7006836"
    },
    "name": "Restaurant2",
    "priceRange": 2,
    "telephone": "222 222 222",
    "url": "http://www.restaurant2.com/"
  }
];


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
    "startTime": "2015-11-05T06:25:56.577Z",
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
    "startTime": "2015-11-06T21:57:22.604Z",
    "underName":{
      "@type": "Person",
      "name": "user1"
    }
  }
];

describe('Testing restaurantsAPI', function () {
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

    it('Get all restaurants', function(done) {
      
      var dataJson = JSON.stringify(restaurantsJSON);

      restaurantsAPI.getAllRestaurants(function(result){
          assert(true, 'Success function called');
          JSON.parse(result).should.deep.equal(restaurantsJSON);
          done();
        }, 
        function(){
          assert(false, 'Error function called');
          done();
        });
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/restaurants/');
        this.requests[0].method.should.equal( 'GET');
        this.requests[0].respond(200, { 'Content-Type': 'text/json' }, dataJson);
    });

    it('Get restaurants by organization', function(done) {
      
      var organizationName = 'organization1';
      var dataJson = JSON.stringify(restaurantsJSON);

      restaurantsAPI.getOrganizationRestaurants(organizationName,function(result){
          assert(true, 'Success function called');
          JSON.parse(result).should.deep.equal(restaurantsJSON);
          done();
        }, 
        function(){
          assert(false, 'Error function called');
          done();
        });
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/restaurants/organization/'+organizationName);
        this.requests[0].method.should.equal( 'GET');
        this.requests[0].respond(200, { 'Content-Type': 'text/json' }, dataJson);
    });


    it('Simplify restaurants format', function() {
        
        var expectedResult = [
            {
              "address": "Street 1",
              "coords": [
                42.8404625,
                -2.5123277
              ],
              "description": "Restaurant description 1",
              "locality": "Locality 1",
              "name": "Retaurant1",
              "ratingValue": 1,
              "region": "Region 1",
              "reviewCount": 1,
              "telephone": "111 111 111"
            },
            {
              "address": "Street 2",
              "coords": [
                42.8538811,
                -2.7006836
              ],
              "description": "Restaurant description 2",
              "locality": "Locality 2",
              "name": "Restaurant2",
              "ratingValue": 2,
              "region": "Region 2",
              "reviewCount": 2,
              "telephone": "222 222 222"
            }
        ];

        var result =
            restaurantsAPI.simplifyRestaurantsFormat(
                JSON.stringify(restaurantsJSON));

        expect(result).to.be.deep.equal(expectedResult);

    });


    it('Create a reservation', function() {
      
      var partySize = 1;
      var restaurantName = 'exampleRestaurant';
      var reservationDatetime = new Date();
      
      var data = {
        '@type': 'FoodEstablishmentReservation',
        'partySize': partySize,
        'reservationFor': {
          '@type': 'FoodEstablishment',
          'name': '' + restaurantName
        },
        'startTime': reservationDatetime.toISOString()
      };

      var dataJson = JSON.stringify(data);

      restaurantsAPI.createNewReservation(restaurantName,partySize,reservationDatetime, function(){
          assert(true, 'Success function called');
        }, 
        function(){
          assert(false, 'Error function called');
        }, data);
        this.requests[0].requestBody.should.equal(dataJson);
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/reservation/');
        this.requests[0].method.should.equal( 'POST');
    });


    it('Cancel a reservation', function() {
      
      var reservationId = '1';
      
      restaurantsAPI.cancelReservation(reservationId, function(){
          assert(true, 'Success function called');
        }, 
        function(){
          assert(false, 'Error function called');
        });
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/reservation/'+reservationId);
        this.requests[0].method.should.equal( 'DELETE');
    });


    it('Get reservations by user', function(done) {
      
      var username = 'user1';
      var dataJson = JSON.stringify(reservationsJSON);

      restaurantsAPI.getUserReservations(username, function(result){
          assert(true, 'Success function called');
          JSON.parse(result).should.deep.equal(reservationsJSON);
          done();
        }, 
        function(){
          assert(false, 'Error function called');
          done();
        });
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/reservations/user/'+username);
        this.requests[0].method.should.equal( 'GET');
        this.requests[0].respond(200, { 'Content-Type': 'text/json' }, dataJson);
    });


    it('Get reservations by restaurant', function(done) {
      
      var restaurantName = 'user1';
      var dataJson = JSON.stringify(reservationsJSON);

      restaurantsAPI.getRestaurantReservations(restaurantName, function(result){
          assert(true, 'Success function called');
          JSON.parse(result).should.deep.equal(reservationsJSON);
          done();
        }, 
        function(){
          assert(false, 'Error function called');
          done();
        });
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/reservations/restaurant/'+restaurantName);
        this.requests[0].method.should.equal( 'GET');
        this.requests[0].respond(200, { 'Content-Type': 'text/json' }, dataJson);
    });

    it('Get reservations by organization', function(done) {
      
      var organizationName = 'user1';
      var dataJson = JSON.stringify(reservationsJSON);

      restaurantsAPI.getOrganizationReservations(organizationName, function(result){
          assert(true, 'Success function called');
          JSON.parse(result).should.deep.equal(reservationsJSON);
          done();
        }, 
        function(){
          assert(false, 'Error function called');
          done();
        });
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/reservations/organization/'+organizationName);
        this.requests[0].method.should.equal( 'GET');
        this.requests[0].respond(200, { 'Content-Type': 'text/json' }, dataJson);
    });


    it('Create a review', function() {
      
      var restaurantName = '1';
      var ratingValue = '5';
      var reviewBody = 'review body test';
      
      var data = {
          '@type': 'Review',
          'itemReviewed': {
            '@type': 'Restaurant',
            'name': '' + restaurantName,
          },
          'name': 'Rating description',
          'reviewBody': '' + reviewBody,
          'reviewRating': {
            '@type': 'Rating',
            'ratingValue': parseInt(ratingValue, 10)
          }
      };

      var dataJson = JSON.stringify(data);

      restaurantsAPI.createNewReview(restaurantName,ratingValue,reviewBody, function(){
          assert(true, 'Success function called');
        }, 
        function(){
          assert(false, 'Error function called');
        }, data);
        this.requests[0].requestBody.should.equal(dataJson);
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/review/');
        this.requests[0].method.should.equal( 'POST');
    });


    it('Update a review', function() {
      
      var reviewId = '1';
      var ratingValue = '5';
      var reviewBody = 'review body test';
      var data = {
        'reviewBody': '' + reviewBody,
        'reviewRating': parseInt(ratingValue, 10)
      };

      var dataJson = JSON.stringify(data);

      restaurantsAPI.updateReview(reviewId,ratingValue,reviewBody, function(){
          assert(true, 'Success function called');
        }, 
        function(){
          assert(false, 'Error function called');
        }, data);
        this.requests[0].requestBody.should.equal(dataJson);
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/review/'+reviewId);
        this.requests[0].method.should.equal( 'PATCH');
    });


    it('Delete a review', function() {
      
      var reviewId = '1';
      
      restaurantsAPI.deleteReview(reviewId, function(){
          assert(true, 'Success function called');
        }, 
        function(){
          assert(false, 'Error function called');
        });
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/review/'+reviewId);
        this.requests[0].method.should.equal( 'DELETE');
    });

    it('Get reviews by user', function(done) {
      
      var username = 'user1';
      var dataJson = JSON.stringify(reviewsJSON);
      
      restaurantsAPI.getUserReviews(username, function(result){
          assert(true, 'Success function called');
          JSON.parse(result).should.deep.equal(reviewsJSON);
          done();
        }, 
        function(){
          assert(false, 'Error function called');
          done();
        });
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/reviews/user/'+username);
        this.requests[0].method.should.equal( 'GET');
        this.requests[0].respond(200, { 'Content-Type': 'text/json' }, dataJson);
    });

    it('Get reviews by restaurant', function(done) {
      
      var restaurantName = 'restaurant1';
      var dataJson = JSON.stringify(reviewsJSON);
      
      restaurantsAPI.getRestaurantReviews(restaurantName, function(result){
          assert(true, 'Success function called');
          JSON.parse(result).should.deep.equal(reviewsJSON);
          done();
        }, 
        function(){
          assert(false, 'Error function called');
          done();
        });
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/reviews/restaurant/'+restaurantName);
        this.requests[0].method.should.equal( 'GET');
        this.requests[0].respond(200, { 'Content-Type': 'text/json' }, dataJson);
    });

    it('Get reviews by organization', function(done) {
      
      var organizationName = 'organization1';
      var dataJson = JSON.stringify(reviewsJSON);
      
      restaurantsAPI.getOrganizationReviews(organizationName, function(result){
          assert(true, 'Success function called');
          JSON.parse(result).should.deep.equal(reviewsJSON);
          done();
        }, 
        function(){
          assert(false, 'Error function called');
          done();
        });
        this.requests[0].url.should.equal(
            'http://tourguide/api/orion/reviews/organization/'+organizationName);
        this.requests[0].method.should.equal( 'GET');
        this.requests[0].respond(200, { 'Content-Type': 'text/json' }, dataJson);
    });

})