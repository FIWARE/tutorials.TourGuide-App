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

var utils = require('../utils');
var idas = require('../idas/ul20');
var config = require('../config');
var fiwareHeaders = {
  'fiware-service': config.fiwareService
};

/* There will be 4 sensors for each restaurant:
 * - Temperature of the Kitchen
 * - Temperature of the Dining room
 * - Humidity of the Kitchen
 * - Humidity of the Dining room
 */

var sensorTypes = ['temperature', 'relativeHumidity'];
var sensorRooms = ['kitchen', 'dining'];
var sensorsPerRestaurant = sensorTypes.length * sensorRooms.length;

/**
 * Create the sensors for each restaurant.
 *
 * @param {Array} restaurantsData - list of restaurants to process.
*/
function feedIDASSensors(restaurantsData) {
  var sensorsAdded = 0;
  var sensorsInitialized = 0;
  var totalSensors = restaurantsData.length * sensorsPerRestaurant;

  console.log('Registering sensors on IDAS.');
  console.log('Number of restaurants: ' + restaurantsData.length);

  // For each restaurant, generate new sensors
  restaurantsData.forEach(function(restaurant) {
    sensorRooms.forEach(function(room) {
      sensorTypes.forEach(function(type) {
        idas.registerSensor(restaurant, room, type)
          .then(function(response) {
            sensorsAdded++;
            console.log('Total sensors added:', sensorsAdded,
                        '/', totalSensors);
            return idas.initializeSensor(restaurant, room, type);
          })
          .then(function(response) {
            sensorsInitialized++;
            console.log('Total sensors initialized:', sensorsInitialized,
                        '/', totalSensors);
          })
          .catch(function(error) {
            console.error('Sensor Error:', error);
          });
      });
    });
  });
}

console.log('Generating sensors for restaurants...');

idas.createService()
  .then(function(response) {
    // Get all the restaurants from Orion.
    return utils.getListByType('Restaurant', null, fiwareHeaders);
  })
  .then(function(data) {
    // Generate the sensors
    var restaurantsData = JSON.parse(JSON.stringify(data.body));
    feedIDASSensors(restaurantsData);
  })
  .catch(function(err) {
    console.error(err);
  });
