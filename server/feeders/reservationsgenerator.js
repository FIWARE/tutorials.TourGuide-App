/*
 * reservations_generator.js
 * Copyright(c) 2015 Bitergia
 * Author: Alvaro del Castillo <acs@bitergia.com>,
 * Alberto Martín <amartin@bitergia.com>
 * MIT Licensed

  Generates random reservations for restaurants in orion

  First it gets all restaurant information
  Then a random automatic reservation is generated
  Then the reservation is added to Orion CB

*/

// jshint node: true

'use strict';

var utils = require('../utils');
var async = require('async');
var shortid = require('shortid'); // unique ids generator
var apiRestSimtasks = 5; // number of simultaneous calls to API REST
var reservationsAdded = 0;
var restaurantsData; // All data for the restaurants to be reserved

var config = require('../config');
var fiwareHeaders = {
  'fiware-service': config.fiwareService
};

var feedOrionReservations = function() {
  var returnPost = function(data) {
    reservationsAdded++;
    console.log(reservationsAdded + '/' + restaurantsData.length);
  };

  // restaurantsData = restaurantsData.slice(0,5); // debug with few items

  console.log('Feeding reservations info in orion.');
  console.log('Number of restaurants: ' + restaurantsData.length);

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
    console.log('Total reservations added: ' + reservationsAdded);
  };

  Object.keys(restaurantsData).forEach(function(element, index) {

    var reservedRestaurant = restaurantsData[index].name;
    var date = new Date().toISOString();
    var reservations = ['Cancelled', 'Confirmed', 'Hold', 'Pending'];

    var attr = {
      'type': 'FoodEstablishmentReservation',
      'id': utils.generateId(reservedRestaurant, date),
      'reservationStatus': {
        'value': utils.randomElement(reservations)
      },
      'underName': {
        'type': 'Person',
        'value': 'user' + utils.randomIntInc(1, 10)
      },
      'reservationFor': {
        'type': 'FoodEstablishment',
        'value': reservedRestaurant
      },
      'address': {
        'type': 'PostalAddress',
        'value': restaurantsData[index].address
      },
      'startTime': {
        'type': 'DateTime',
        'value': utils.getRandomDate().toISOString()
      },
      'partySize': {
        'value': utils.randomIntInc(1, 20)
      }
    };

    q.push({
      'attributes': attr
    }, returnPost);
  });
};

// Load restaurant data from Orion
var loadRestaurantData = function() {

  // Once we have all data for restaurants generate reviews for them

  var processRestaurants = function(data) {
    restaurantsData = JSON.parse(JSON.stringify(data.body));
    feedOrionReservations();
  };
  utils.getListByType('Restaurant',null,fiwareHeaders)
  .then(processRestaurants)
  .catch(function(err) {
    console.error(err);
  });
};

console.log('Generating random reservations for restaurants ...');

loadRestaurantData();
