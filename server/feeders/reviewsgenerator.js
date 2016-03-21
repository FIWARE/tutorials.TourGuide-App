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

// jshint node: true, nonstandard: true

'use strict';

var utils = require('../utils');
var async = require('async');
var shortid = require('shortid'); // unique ids generator
var apiRestSimtasks = 1; // number of simultaneous calls to API REST
var reviewsAdded = 0;
var restaurantsData; // All data for the restaurants to be reviewed
var delay = 200; //time in ms
var restaurantsModified = 0;

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
      console.log(err);
    });
  }, apiRestSimtasks);

  q.drain = function() {
    console.log('Total reviews added: ' + reviewsAdded);
    triggerRestaurantsRatings();
  };

  Object.keys(restaurantsData).forEach(function(element, pos) {

    var reviewId = restaurantsData[pos].id + '-' + shortid.generate();

    var attr = {
      'type': 'Review',
      'id': utils.asciiEncode(reviewId),
      'itemReviewed': {
        'type': 'Restaurant',
        'value': utils.fixedEncodeURIComponent(restaurantsData[pos].name)
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
        'type': 'date',
        'value': new Date().toISOString()
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

  var reviews;
  var restaurantReviews;
  var servicePath;

  var q = async.queue(function(task, callback) {
    var restaurantId = utils.asciiEncode(
      utils.stripForbiddenChars(
        unescape(task.restaurantName)));
    setTimeout(function() {
      utils.getListByType(
        'Restaurant',
        restaurantId,
        fiwareHeaders)
      .then(function(data) {
        var fwHeaders = JSON.parse(JSON.stringify(fiwareHeaders));
        if (typeof data.body.department !== 'undefined') {
          fwHeaders['fiware-servicepath'] = '/' + data.body.department;
        }
        utils.sendRequest(
          'PATCH',
          task.aggregateRatings,
          restaurantId,
          fwHeaders)
        .then(callback)
        .catch(function(err) {
          console.log(err.error);
        });
      })
      .catch(function(err) {
        console.log(err.error);
      });
    }, delay);
  }, apiRestSimtasks);

  q.drain = function() {
    console.log('Total restaurants modified: ' + restaurantsModified);
  };

  utils.getListByType('Review', null, fiwareHeaders)
  .then(function(data) {
    reviews = data.body;
    Object.keys(restaurantsData).forEach(function(element, pos) {
      var restaurantName = restaurantsData[pos].name;
      restaurantReviews = utils.getRestaurantReviews(
        restaurantName,
        reviews);
      var ratings = utils.getAggregateRating(
        restaurantReviews);
      q.push({'aggregateRatings': ratings,
        'restaurantName': restaurantName}, returnPost);
    });
  })
  .catch(function(err) {
    console.log(err);
  });
};

// Load restaurant data from Orion
var loadRestaurantData = function() {

  var processRestaurants = function(data) {
    restaurantsData = JSON.parse(JSON.stringify(data.body));
    feedOrionReviews();
  };

  utils.getListByType('Restaurant', null, fiwareHeaders)
  .then(processRestaurants)
  .catch(function(err) {
    console.log(err);
  });
};

console.log('Generating random reviews for restaurants ...');

loadRestaurantData();
