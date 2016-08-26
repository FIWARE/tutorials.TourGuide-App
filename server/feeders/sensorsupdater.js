/*
 * sensorsupdater.js
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
 * Update the sensors data for each restaurant.
 *
 * @param {Array} restaurantsData - List of restaurants to process.
*/
function feedIDASSensors(restaurantsData) {
  var sensorsUpdated = 0;
  var totalSensors = restaurantsData.length * sensorsPerRestaurant;

  console.log('Updating sensors on IDAS.');
  console.log('Number of restaurants: ' + restaurantsData.length);

  // For each restaurant, update the sensors data (if sensor exists)
  restaurantsData.forEach(function(restaurant) {
    sensorRooms.forEach(function(room) {
      sensorTypes.forEach(function(type) {
        var attrName = type + ':' + room;
        var oldValue = restaurant[attrName];
        if (oldValue) {
          var newValue = generateRandomValue(oldValue,type);
          var deviceId = idas.getDeviceId(restaurant, room, type);
          idas.updateSensor(deviceId, type, newValue, restaurant.department)
            .then(function(response) {
              sensorsUpdated++;
              console.log('Total Sensors:', totalSensors,
                          ', Updated:', sensorsUpdated
                         );
            })
            .catch(function(error) {
              console.error('updateSensor Error:', error);
            });
        }
      });
    });
  });
}

/**
 * Generates a new sensor value using the old value as base.
 *
 * @param {Number} oldValue - Old value of the sensor.
 * @param {String} type - Sensor type.
 * @return {Number} newValue - New sensor value.
*/
function generateRandomValue(oldValue, type) {
  var newValue;
  var MIN = 0;
  var MAX = 100;

  if (type === 'relativeHumidity') {
    oldValue *= 100;
  }

  if (oldValue) {
    // generate a new value using the old value as base
    var sign = Date.now() % 2;
    var variance = Date.now() % 3;
    if (sign === 0) {
      newValue = parseInt(oldValue) + variance;
      newValue = newValue > MAX ? MAX : newValue;
    } else {
      newValue = parseInt(oldValue) - variance;
      newValue = newValue < MIN ? MIN : newValue;
    }
  } else {
    newValue = Date.now() % MAX;
  }

  if (type === 'relativeHumidity') {
    newValue /= 100;
  }

  return newValue;
}

console.log('Updating restaurant sensors...');

// Get all the restaurants from Orion.
utils.getListByType('Restaurant', null, fiwareHeaders)
  .then(function(data) {
    // Update the sensors
    var restaurantsData = JSON.parse(JSON.stringify(data.body));
    feedIDASSensors(restaurantsData);
  })
  .catch(function(err) {
    console.error(err);
  });
