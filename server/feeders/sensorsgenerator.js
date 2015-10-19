/*
 * sensorsgenerator.js
 * Copyright(c) 2015 Bitergia
 * Author: David Muriel <dmuriel@bitergia.com>,
 * MIT Licensed

  Generates sensors for all the restaurants.

  First it creates a new service.
  Then registers the sensors for each restaurant.

*/

// jshint node: true

'use strict';

var async = require('async');
var authRequest = require('../authrequest');
var idas = require('../idas/ul20');

var apiRestSimtasks = 10;
var restaurantsData;
var sensorsAdded = 0;
var sensorsInitialized = 0;

/* There will be 4 sensors for each restaurant:
 * - Temperature of the Kitchen
 * - Temperature of the Dinner
 * - Humidity of the Kitchen
 * - Humidity of the Dinner
 */

var sensorsPerRestaurant = 4;
var sensorTypes = ['SENSOR_TEMP', 'SENSOR_HUM'];
var sensorPlaces = ['Kitchen', 'Dining'];

var feedIDASSensors = function() {

  var totalSensors = restaurantsData.length * sensorsPerRestaurant;

  var cbShowProgress = function() {
    console.log('Total Sensors:', totalSensors,
                ', Created:', sensorsAdded,
                ', Initialized:', sensorsInitialized);
  };

  console.log('Registering sensors on IDAS.');
  console.log('Number of restaurants: ' + restaurantsData.length);

  // Limit the number of calls to be done in parallel
  var q = async.queue(function(task, callback) {
    idas.registerSensor(task.name, task.type)
      .then(
        function(response) {
          sensorsAdded++;
          return idas.initializeSensor(task.name, task.type)
            .delay(100) // This is to avoid clogging iotagent with requests.
            .then(
              function(response) {
                sensorsInitialized++;
              },
              function(error) {
                console.log('initializeSensor Error:', error);
              });
        },
        function(error) {
          console.log('createSensor Error:', error);
        })
      .done(
        function(response) {
          callback();
        });
  }, apiRestSimtasks);

  // Display totals when queue is empty
  q.drain = function() {
    console.log('Total sensors added:', sensorsAdded,
                '/', totalSensors);
    console.log('Total sensors initialized:', sensorsInitialized,
                '/', totalSensors);
  };

  // For each restaurant, generate a new temperature sensor
  Object.keys(restaurantsData).forEach(function(element, pos) {
    // generate sensor base name
    var sensorBaseName = restaurantsData[pos].id;
    sensorPlaces.forEach(function(place) {
      sensorTypes.forEach(function(type) {
        q.push({
          'name': sensorBaseName + '_' + place,
          'type': type
        }, cbShowProgress);
      });
    });
  });
};

// Load restaurant data from Orion
var loadRestaurantData = function() {

  // Generate the sensors once we have all restaurant data
  var processRestaurants = function(data) {
    restaurantsData = JSON.parse(JSON.stringify(data.body));
    feedIDASSensors();
  };

  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'Restaurant','limit': '1000'})
  .then(processRestaurants)
  .catch(function(err) {
    console.log(err);
  });
};

console.log('Generating sensors for restaurants...');

idas.createService()
  .done(function(response) {
    loadRestaurantData();
  });
