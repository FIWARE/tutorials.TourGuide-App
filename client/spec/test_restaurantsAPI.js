var restaurantsAPI = require('../js/restaurantsAPI.js')
var chai = require('chai');
var assert = require('chai').assert;
require('./helpers/data.js');
chai.should();

var baseURL = 'http://tourguide/api/orion/';

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
      function() {
        assert(false, 'Error function called');
        done();
      });
    this.requests[0].url.should.equal(baseURL + 'restaurants/');
    this.requests[0].method.should.equal('GET');
    this.requests[0].respond(200, { 'Content-Type': 'application/json' }, 
      dataJson);
  });

  it('Get restaurants by organization', function(done) { 
    var organizationName = 'organization1';
    var dataJson = JSON.stringify(restaurantsJSON);

    restaurantsAPI.getOrganizationRestaurants(organizationName,
      function(result){
        assert(true, 'Success function called');
        JSON.parse(result).should.deep.equal(restaurantsJSON);
        done();
      }, 
      function() {
        assert(false, 'Error function called');
        done();
      });
    this.requests[0].url.should.equal(
      baseURL + 'restaurants/organization/' + organizationName);
    this.requests[0].method.should.equal('GET');
    this.requests[0].respond(200, { 'Content-Type': 'application/json' },
      dataJson);
  });

  it('Simplify restaurants format', function() {     
    var expectedResult = require('./helpers/simplifiedRestaurant.js');
    var result =
      restaurantsAPI.simplifyRestaurantsFormat(JSON.stringify(restaurantsJSON));

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

    restaurantsAPI.createNewReservation(restaurantName,partySize,
      reservationDatetime, function() {
        assert(true, 'Success function called');
      }, 
      function() {
        assert(false, 'Error function called');
      }, data);
    this.requests[0].requestBody.should.equal(dataJson);
    this.requests[0].url.should.equal(baseURL + 'reservation/');
    this.requests[0].method.should.equal('POST');
  });

  it('Cancel a reservation', function() {   
    var reservationId = '1';
    
    restaurantsAPI.cancelReservation(reservationId, function() {
        assert(true, 'Success function called');
      }, 
      function() {
        assert(false, 'Error function called');
      });
    this.requests[0].url.should.equal(baseURL + 'reservation/' + reservationId);
    this.requests[0].method.should.equal('DELETE');
  });

  it('Get reservations by user', function(done) {     
    var username = 'user1';
    var dataJson = JSON.stringify(reservationsJSON);

    restaurantsAPI.getUserReservations(username, function(result){
        assert(true, 'Success function called');
        JSON.parse(result).should.deep.equal(reservationsJSON);
        done();
      }, 
      function() {
        assert(false, 'Error function called');
        done();
      });
    this.requests[0].url.should.equal(
      baseURL + 'reservations/user/' + username);
    this.requests[0].method.should.equal('GET');
    this.requests[0].respond(200, { 'Content-Type': 'application/json' },
      dataJson);
  });

  it('Get reservations by restaurant', function(done) {      
    var restaurantName = 'user1';
    var dataJson = JSON.stringify(reservationsJSON);

    restaurantsAPI.getRestaurantReservations(restaurantName, function(result){
        assert(true, 'Success function called');
        JSON.parse(result).should.deep.equal(reservationsJSON);
        done();
      }, 
      function() {
        assert(false, 'Error function called');
        done();
      });
    this.requests[0].url.should.equal(
       baseURL + 'reservations/restaurant/' + restaurantName);
    this.requests[0].method.should.equal('GET');
    this.requests[0].respond(200, { 'Content-Type': 'application/json' },
      dataJson);
  });

  it('Get reservations by organization', function(done) {      
    var organizationName = 'user1';
    var dataJson = JSON.stringify(reservationsJSON);

    restaurantsAPI.getOrganizationReservations(organizationName, 
      function(result){
        assert(true, 'Success function called');
        JSON.parse(result).should.deep.equal(reservationsJSON);
        done();
      }, 
      function() {
        assert(false, 'Error function called');
        done();
      });
    this.requests[0].url.should.equal(
        baseURL + 'reservations/organization/' + organizationName);
    this.requests[0].method.should.equal('GET');
    this.requests[0].respond(200, { 'Content-Type': 'application/json' },
      dataJson);
  });

  it('Create a review', function() {      
    var restaurantName = '1';
    var RATINGVALUE = '5';
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
          'ratingValue': parseInt(RATINGVALUE, 10)
        }
    };

    var dataJson = JSON.stringify(data);

    restaurantsAPI.createNewReview(restaurantName,RATINGVALUE,reviewBody, 
      function() {
        assert(true, 'Success function called');
      }, 
      function() {
        assert(false, 'Error function called');
      }, data);
    this.requests[0].requestBody.should.equal(dataJson);
    this.requests[0].url.should.equal(baseURL + 'review/');
    this.requests[0].method.should.equal('POST');
  });

  it('Update a review', function() {     
    var reviewId = '1';
    var RATINGVALUE = '5';
    var reviewBody = 'review body test';
    var data = {
      'reviewBody': '' + reviewBody,
      'reviewRating': parseInt(RATINGVALUE, 10)
    };

    var dataJson = JSON.stringify(data);

    restaurantsAPI.updateReview(reviewId,RATINGVALUE,reviewBody, function() {
        assert(true, 'Success function called');
      }, 
      function() {
        assert(false, 'Error function called');
      }, data);
    this.requests[0].requestBody.should.equal(dataJson);
    this.requests[0].url.should.equal(baseURL + 'review/' + reviewId);
    this.requests[0].method.should.equal('PATCH');
  });

  it('Delete a review', function() {     
    var reviewId = '1';
    
    restaurantsAPI.deleteReview(reviewId, function() {
        assert(true, 'Success function called');
      }, 
      function() {
        assert(false, 'Error function called');
      });
    this.requests[0].url.should.equal(baseURL + 'review/' + reviewId);
    this.requests[0].method.should.equal('DELETE');
  });

  it('Get reviews by user', function(done) {  
    var username = 'user1';
    var dataJson = JSON.stringify(reviewsJSON);
    
    restaurantsAPI.getUserReviews(username, function(result){
        assert(true, 'Success function called');
        JSON.parse(result).should.deep.equal(reviewsJSON);
        done();
      }, 
      function() {
        assert(false, 'Error function called');
        done();
      });
    this.requests[0].url.should.equal(baseURL + 'reviews/user/' +username);
    this.requests[0].method.should.equal('GET');
    this.requests[0].respond(200, { 'Content-Type': 'application/json' }, 
      dataJson);
  });

  it('Get reviews by restaurant', function(done) {  
    var restaurantName = 'restaurant1';
    var dataJson = JSON.stringify(reviewsJSON);
    
    restaurantsAPI.getRestaurantReviews(restaurantName, function(result){
        assert(true, 'Success function called');
        JSON.parse(result).should.deep.equal(reviewsJSON);
        done();
      }, 
      function() {
        assert(false, 'Error function called');
        done();
      });
    this.requests[0].url.should.equal(
        baseURL + 'reviews/restaurant/' + restaurantName);
    this.requests[0].method.should.equal('GET');
    this.requests[0].respond(200, { 'Content-Type': 'application/json' }, 
      dataJson);
  });

  it('Get reviews by organization', function(done) {  
    var organizationName = 'organization1';
    var dataJson = JSON.stringify(reviewsJSON);
    
    restaurantsAPI.getOrganizationReviews(organizationName, function(result){
        assert(true, 'Success function called');
        JSON.parse(result).should.deep.equal(reviewsJSON);
        done();
      }, 
      function() {
        assert(false, 'Error function called');
        done();
      });
    this.requests[0].url.should.equal(
        baseURL + 'reviews/organization/' + organizationName);
    this.requests[0].method.should.equal('GET');
    this.requests[0].respond(200, { 'Content-Type': 'application/json' }, 
      dataJson);
  });
})
