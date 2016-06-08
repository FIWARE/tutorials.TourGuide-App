/*
 * reviews_generator.js
 * Copyright(c) 2015 Bitergia
 * Author: Alvaro del Castillo <acs@bitergia.com>,
 * Alberto Martín <amartin@bitergia.com>
 * MIT Licensed

  Generates random reviews for restaurants in orion

  First it gets all restaurant information
  Then a random automatic review is generated
  Then the review is added to Orion CB

  TODO:
  - Create more real reviews using templates for comments and random ratings
*/

// jshint node: true

'use strict';

var utils = require('../utils');
var async = require('async');
var shortid = require('shortid'); // unique ids generator
var apiRestSimtasks = 1; // number of simultaneous calls to API REST
var reviewsAdded = 0;
var restaurantsData; // All data for the restaurants to be reviewed
var delay = 200; //time in ms
var restaurantsModified = 0;

var RESTAURANT_TYPE = 'Restaurant';
var REVIEW_TYPE = 'Review';

var config = require('../config');
var fiwareHeaders = {
  'fiware-service': config.fiwareService
};

var feedOrionReviews = function() {
  var returnPost = function(data) {
    reviewsAdded++;
    console.log(reviewsAdded + '/' + restaurantsData.length);
  };

  // restaurantsData = restaurantsData.slice(0,5); // debug with few items

  console.log('Feeding reviews info in orion.');
  console.log('Total tried: ' + restaurantsData.length);

  // Limit the number of calls to be done in parallel to orion
  var q = async.queue(function(task, callback) {
    var attributes = task.attributes;
    utils.sendRequest('POST', attributes, null, fiwareHeaders)
    .then(callback)
    .catch(function(err) {
      console.error(err);
    });
  }, apiRestSimtasks);

  q.drain = function() {
    console.log('Total reviews added: ' + reviewsAdded);
    triggerRestaurantsRatings();
  };

  restaurantsData.forEach(function(element) {

    var reviewedRestaurant = element.name;
    var date = new Date().toISOString();

    var attr = {
      'type': REVIEW_TYPE,
      'id': utils.generateId(reviewedRestaurant, date),
      'itemReviewed': {
        'type': RESTAURANT_TYPE,
        'value': reviewedRestaurant
      },
      'reviewRating': {
        'type': 'Rating',
        'value': utils.randomIntInc(1, 5)
      },
      'author': {
        'type': 'Person',
        'value': 'user' + utils.randomIntInc(1, 10)
      },
      'reviewBody': {
        'value': 'Body review'
      },
      'dateCreated': {
        'type': 'DateTime',
        'value': date
      },
      'publisher': {
        'type': 'Organization',
        'value': 'Bitergia'
      }
    };

    q.push({
      'attributes': attr
    }, returnPost);
  });
};

var triggerRestaurantsRatings = function() {

  var returnPost = function(data) {
    restaurantsModified++;
    console.log(restaurantsModified + '/' + restaurantsData.length);
  };

  var q = async.queue(function(task, callback) {
    var restaurantId = utils.generateId(task.restaurantName);
    setTimeout(function() {
      utils.getListByType(RESTAURANT_TYPE, restaurantId, fiwareHeaders)
      .then(function(data) {
        var fwHeaders = utils.completeHeaders(fiwareHeaders,
                                              data.body.department);
        return utils.sendRequest('PATCH', task.aggregateRatings, restaurantId,
                                 fwHeaders);
      })
      .then(callback)
      .catch(function(err) {
        console.error(err.error);
      });
    }, delay);

  }, apiRestSimtasks);

  q.drain = function() {
    console.log('Total restaurants modified: ' + restaurantsModified);
  };

  restaurantsData.forEach(function(element) {
    var restaurantName = element.name;
    var filter = [];
    var queryString = {};
    utils.addConditionToQuery(filter, 'itemReviewed', '==', restaurantName);
    queryString.q = filter.join(';');
    utils.getListByType(REVIEW_TYPE, null, fiwareHeaders, queryString)
    .then(function(restaurantReviews) {
      var ratings = utils.getAggregateRating(restaurantReviews.body);
      q.push({'aggregateRatings': ratings, 'restaurantName': restaurantName},
             returnPost);
    })
    .catch(function(err) {
      console.error(err.error);
    });
  });
};

// Load restaurant data from Orion
var loadRestaurantData = function() {

  var processRestaurants = function(data) {
    restaurantsData = JSON.parse(JSON.stringify(data.body));
    feedOrionReviews();
  };

  utils.getListByType(RESTAURANT_TYPE, null, fiwareHeaders)
  .then(processRestaurants)
  .catch(function(err) {
    console.error(err);
  });
};

console.log('Generating random reviews for restaurants ...');

loadRestaurantData();
