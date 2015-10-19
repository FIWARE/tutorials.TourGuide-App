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
var authRequest = require('../authrequest');
var apiRestSimtasks = 2; // number of simultaneous calls to API REST
var reviewsAdded = 0;
var restaurantsData; // All data for the restaurants to be reviewed

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

    authRequest('/v2/entities', 'POST', attributes)
    .then(callback)
    .catch(function(err) {
      console.log(err);
    });
  }, apiRestSimtasks);

  q.drain = function() {
    console.log('Total reviews added: ' + reviewsAdded);
  };

  Object.keys(restaurantsData).forEach(function(element, pos) {
    // Call orion to append the entity
    var rname = restaurantsData[pos].id;
    rname += '-' + shortid.generate();
    // Time to add first attribute to orion as first approach

    var attr = {
      '@context': 'http://schema.org',
      'type': 'Review',
      'id': rname,
      'itemReviewed': {},
      'reviewRating': {},
      'name': 'Rating description',
      'author': {},
      'reviewBody': 'Body review',
      'publisher': {}
    };

    attr.itemReviewed['@type'] = 'Restaurant';
    attr.itemReviewed.name = restaurantsData[pos].id;

    attr.reviewRating['@type'] = 'Rating';
    attr.reviewRating.ratingValue = utils.randomIntInc(1, 5);

    attr.author['@type'] = 'Person';
    attr.author.name = 'user' + utils.randomIntInc(1, 10);

    attr.publisher['@type'] = 'Organization';
    attr.publisher.name = 'Bitergia';

    q.push({
      'attributes': attr
    }, returnPost);
  });
};

// Load restaurant data from Orion
var loadRestaurantData = function() {

  var processRestaurants = function(data) {
    restaurantsData = JSON.parse(JSON.stringify(data.body));
    feedOrionReviews();
  };

  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'Restaurant', 'limit': '1000'})
  .then(processRestaurants)
  .catch(function(err) {
    console.log(err);
  });
};

console.log('Generating random reviews for restaurants ...');

loadRestaurantData();
