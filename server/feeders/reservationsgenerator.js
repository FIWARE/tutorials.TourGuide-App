/*
 * reservations_generator.js
 * Copyright(c) 2015 Bitergia
 * Author: Alvaro del Castillo <acs@bitergia.com>,
 * Alberto Martín <amartin@bitergia.com>
 * MIT Licensed
 *
 *  Generates random reservations for restaurants in orion
 *
 *  First it gets all restaurant information
 *  A random automatic reservation is generated
 *  Then the reservation is added to Orion CB
*/

// jshint node: true

'use strict';

var path = require('path');
var utils = require('../utils');
var shortid = require('shortid'); // unique ids generator

var RESTAURANT_TYPE = 'Restaurant';
var RESERVATION_TYPE = 'FoodEstablishmentReservation';
var reservationsAdded = 0;
var restaurantsData; // All data for the restaurants to be reserved
var fromDate;
var toDate;
var restaurantSelected;
var numberOfReservations = 1;

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
    'Generate random reservations of restaurant/s between the provided dates.',
    '',
    'Usage: ' + progname + ' <options>',
    '',
    'Available options:',
    '',
    '  -h  --help                          Show this help.',
    '  -s  --fromDate                      Select a date to start (ISO8601 format).',
    '  -e  --toDate                        Select an end date (ISO8601 format).',
    '  -r  --restaurant                    Load reservations for the restaurant of the JSON provided ',
    '                                      using its name. Without this value, it will generate ',
    '                                      reservations for all the restaurants loaded. ',
    '  -n  --numberOfReservations          Load a defined number of reservations (for each restaurant)',
    '                                      among the provided ones.',
    '',
    'NOTE: restaurants must be previously loaded to generate reservations. ',
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
      s: 'fromDate',
      e: 'toDate',
      r: 'restaurant',
      n: 'numberOfReservations'
    }
  });

  if (argv.help) {
    showHelp();
  }

  if (typeof argv.fromDate === 'string' &&
      argv.fromDate !== '') {
    fromDate = argv.fromDate;
  }

  if (typeof argv.toDate === 'string' &&
      argv.toDate !== '') {
    toDate = argv.toDate;
  }

  if (typeof argv.restaurant === 'string' &&
      argv.restaurant !== '') {
    restaurantSelected = argv.restaurant;
  }

  if (typeof argv.numberOfReservations === 'number' &&
      argv.numberOfReservations !== '') {
    numberOfReservations = argv.numberOfReservations;
  }

  if (!argv.restaurant && argv.numberOfReservations) {
    console.error('\'numberOfReservations\' needs a \'restaurant\' ' +
                  'to load into. Please try again.');
    showHelp();
    process.exit(1);
  }

}

/**
 * Function to load the restaurant information into a variable
*/
function processRestaurants(data) {
  restaurantsData = utils.objectToArray(JSON.parse(JSON.stringify(data.body)));
  feedOrionReservations();
}

/**
 * Function to get the restaurant information for the reservations
*/
function getRestaurantInformation() {
  if (restaurantSelected) {
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
 * Function to log the process of the reservations loading
*/
function logProgress() {
  reservationsAdded++;
  var message = restaurantsData.length;
  if (numberOfReservations > 1) {
    message = numberOfReservations;
  }
  console.log(reservationsAdded + '/' + message);
}

/**
 * Function that generates a Reservation
 *
 * @param {Object} restaurant - Restaurant of the reservation
*/
function createReservations(restaurant) {
  var reservedRestaurant = restaurant.name;
  var date = utils.getRandomDate(fromDate, toDate).toISOString();
  var user = 'user' + utils.randomIntInc(1, 10);
  var random = Math.random();
  var occupancyLevels;

  var attr = {
    'type': RESERVATION_TYPE,
    'id': utils.generateId(reservedRestaurant, random),
    'reservationStatus': {
      'value': 'Confirmed'
    },
    'underName': {
      'type': 'Person',
      'value': user
    },
    'reservationFor': {
      'type': 'FoodEstablishment',
      'value': reservedRestaurant
    },
    'address': {
      'type': 'PostalAddress',
      'value': restaurant.address
    },
    'startTime': {
      'type': 'DateTime',
      'value': date
    },
    'partySize': {
      'value': utils.randomIntInc(1, 10)
    }
  };

  sendReservation(attr);
}

/**
 * Function to load reservations into Orion
 *
 * @param {String} restaurant - Restaurant of the reservation
*/
function sendReservation(restaurant) {
  utils.sendRequest('POST', restaurant, null, fiwareHeaders)
  .then(logProgress)
  .catch(function(err) {
    console.error(err.error);
  });
}

/**
 * Function that generates reservations based in the CLI parameters
*/
function feedOrionReservations() {
  console.log('Feeding reservations info in orion.');
  if (restaurantSelected) {
    var counter = numberOfReservations;
    while (counter--) {
      createReservations(restaurantsData[0]);
    }
  } else {
    restaurantsData.forEach(function(element) {
      createReservations(element);
    });
  }
}

parseArgs();
getRestaurantInformation();
