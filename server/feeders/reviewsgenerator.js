/*
 * reviews_generator.js
 * Copyright(c) 2015 Bitergia
 * Author: Alvaro del Castillo <acs@bitergia.com>,
 * Alberto Martín <amartin@bitergia.com>
 * MIT Licensed
 *
 *  Generates random reviews for restaurants in orion
 *
 *  First it gets all restaurant information
 *  A random automatic review is generated
 *  Then the review is added to Orion CB
 *
*/

// jshint node: true

'use strict';

var path = require('path');
var utils = require('../utils');
var async = require('async');
var shortid = require('shortid'); // unique ids generator
var apiRestSimtasks = 1; // number of simultaneous calls to API REST
var reviewsAdded = 0;
var restaurantsData; // All data for the restaurants to be reviewed
var delay = 200; //time in ms
var restaurantsModified = 0;
var organization;
var restaurantSelected;
var numberOfReviews = 1;

var RESTAURANT_TYPE = 'Restaurant';
var REVIEW_TYPE = 'Review';

var config = require('../config');
var fiwareHeaders = {
  'fiware-service': config.fiwareService
};

/**
 * Function to display a help menu using the CLI
*/
function showHelp() {
  var progname = path.basename(process.argv[1]);
  // jshint multistr: true, maxlen: false
  // jscs:disable maximumLineLength, disallowMultipleLineStrings
  var helpMessage = [
    '',
    'Generate random reviews for the restaurant/s loaded.',
    '',
    'Usage: ' + progname + ' <options>',
    '',
    'Available options:',
    '',
    '  -h  --help                          Show this help.',
    '  -o  --organization                  Load reviews for all the restaurants of the given organization.',
    '  -r  --restaurant                    Load a review for a restaurant of the JSON provided using its name.',
    '  -n  --numberOfReviews               Load a defined number of reviews (for each restaurant)',
    '                                      among the provided ones.',
    '',
    'NOTE: restaurants must be previously loaded to generate reviews.',
    ''].join('\n');
  // jshint multistr: false, maxlen: 80
  // jscs:enable
  console.log(helpMessage);
  process.exit(0);
}

/**
 * Function to parse the arguments given launching the script
*/
function parseArgs() {
  if (process.argv.length < 3) {
    // no args, use defaults
    return;
  }

  var argv = require('minimist')(process.argv.slice(2), {
    alias: {
      h: 'help',
      o: 'organization',
      r: 'restaurant',
      n: 'numberOfReviews'
    }
  });

  if (argv.help) {
    showHelp();
  }

  if (typeof argv.organization === 'string' &&
      argv.organization !== '') {
    organization = argv.organization;
  }

  if (typeof argv.restaurant === 'string' &&
      argv.restaurant !== '') {
    restaurantSelected = argv.restaurant;
  }

  if (typeof argv.numberOfReviews === 'number' &&
      argv.numberOfReviews !== '') {
    numberOfReviews = argv.numberOfReviews;
  }

  if (argv.organization && argv.restaurant) {
    console.error('\'organization\' and \'restaurant\' ' +
                  'are incompatible. Please try again.');
    showHelp();
    process.exit(1);
  }

  if (!argv.restaurant && argv.numberOfReviews) {
    console.error('\'numberOfReviews\' needs a \'restaurant\' ' +
                  'to load into. Please try again.');
    showHelp();
    process.exit(1);
  }
}

/**
 * Function to load the restaurant information into a variable
 *
 * @param {Object} data - Restaurants information
*/
function processRestaurants(data) {
  restaurantsData = utils.objectToArray(JSON.parse(JSON.stringify(data.body)));
  feedOrionReviews();
}

/**
 * Function to get the restaurant information for the reviews
*/
function getRestaurantInformation() {
  if (organization) {
    var filter = [];
    var queryString = {};
    utils.addConditionToQuery(filter, 'department', '==', organization);
    queryString.q = filter.join(';');
    utils.getListByType(RESTAURANT_TYPE, null, fiwareHeaders, queryString)
    .then(processRestaurants)
    .catch(function(err) {
      console.error(err.error);
    });
  }  else if (restaurantSelected) {
    var restaurantId = utils.generateId(restaurantSelected);
    utils.getListByType(RESTAURANT_TYPE, restaurantId, fiwareHeaders)
    .then(processRestaurants)
    .catch(function(err) {
      console.error(err);
    });
  } else {
    utils.getListByType(RESTAURANT_TYPE, null, fiwareHeaders)
    .then(processRestaurants)
    .catch(function(err) {
      console.error(err);
    });
  }
}

/**
 * Function to log the process of the reviews loading
*/
function logProgress() {
  reviewsAdded++;
  var message = restaurantsData.length;
  if (numberOfReviews > 1) {
    message = numberOfReviews;
  }
  console.log(reviewsAdded + '/' + message);
}

/**
 * Function to get all the information of a given Restaurant
 *
 * @param {String} restaurantId - The restaurant identifier
*/
function getRestaurant(restaurantId) {
  return utils.getListByType(RESTAURANT_TYPE, restaurantId, fiwareHeaders);
}

/**
 * Function to get a list of the reviews of a restaurant
 *
 * @param {Object} restaurant - The restaurant object
*/
function getRestaurantReviews(restaurant) {
  var restaurantName = restaurant.name;
  var filter = [];
  var queryString = {};
  utils.addConditionToQuery(filter, 'itemReviewed', '==', restaurantName);
  queryString.q = filter.join(';');
  return utils.getListByType(REVIEW_TYPE, null, fiwareHeaders, queryString);
}

/**
 * Function to update the rating of the restaurant
 *
 * @param {String} restaurantId - The restaurant identifier
 * @param {Object} fwHeaders - The request headers
 * @param {Object} ratings - The rating to modify
*/
function updateRestaurantReviews(restaurantId, fwHeaders, ratings) {
  return utils.sendRequest('PATCH', ratings, restaurantId, fwHeaders);
}

/**
 * Function to send the review to Orion Context Broker
 *
 * @param {Object} review - The generated review
*/
function sendReview(review) {
  return utils.sendRequest('POST', review, null, fiwareHeaders);
}

/**
 * Function to generate a review of a given restaurant
 *
 * @param {Object} restaurant - Restaurant object
*/
function generateReviews(restaurant) {
  var reviewedRestaurant = restaurant.name;
  var date = new Date().toISOString();
  var user = 'user' + utils.randomIntInc(1, 10);
  var random = Math.random();

  var attr = {
    'type': REVIEW_TYPE,
    'id': utils.generateId(reviewedRestaurant, random),
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
      'value': user
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

  var restaurantId = utils.generateId(attr.itemReviewed.value);
  var fwHeaders;

  sendReview(attr)
  .then(function(response) {
    return getRestaurant(restaurantId);
  })
  .then(function(restaurant) {
    fwHeaders = utils.completeHeaders(fiwareHeaders,
                                      restaurant.body.department);
    return getRestaurantReviews(restaurant.body);
  })
  .then(function(reviews) {
    var ratings = utils.getAggregateRating(reviews.body);
    return updateRestaurantReviews(restaurantId, fwHeaders, ratings);
  })
  .then(logProgress)
  .catch(function(err) {
    console.error(err.error);
  });
}

/**
 * Function to iterate and generate the reviews
*/
function feedOrionReviews() {
  console.log('Feeding reviews info in orion.');
  if (restaurantSelected) {
    var counter = numberOfReviews;
    while (counter--) {
      generateReviews(restaurantsData[0]);
    }
  } else {
    restaurantsData.forEach(function(element) {
      generateReviews(element);
    });
  }
}

parseArgs();
getRestaurantInformation();
