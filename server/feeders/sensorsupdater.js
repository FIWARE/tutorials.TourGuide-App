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

var restaurantsData;
var sensorsUpdated = 0;

/* There will be 4 sensors for each restaurant:
 * - Temperature of the Kitchen
 * - Temperature of the Dining room
 * - Humidity of the Kitchen
 * - Humidity of the Dining room
 */

var sensorsPerRestaurant = 4;
var sensorTypes = ['temperature', 'humidity'];
var sensorRooms = ['kitchen', 'dining'];

var feedIDASSensors = function() {

  var totalSensors = restaurantsData.length * sensorsPerRestaurant;

  console.log('Registering sensors on IDAS.');
  console.log('Number of restaurants: ' + restaurantsData.length);

  // For each restaurant, generate a new sensors
  Object.keys(restaurantsData).forEach(function(index) {
    var restaurant = restaurantsData[index];
    sensorRooms.forEach(function(room) {
      sensorTypes.forEach(function(type) {
        var attrName = type + ':' + room;
        if (restaurant[attrName]) {
          var newValue = generateRandomValue(
            restaurant[attrName],0,100
          );
          var deviceId = idas.getDeviceId(restaurant, room, type);
          idas.updateSensor(deviceId, type, newValue, restaurant.department)
            .then(function(response) {
              sensorsUpdated++;
              console.log('Total Sensors:', totalSensors,
                          ', Updated:', sensorsUpdated
                         );
            })
            .catch(function(error) {
              console.log('updateSensor Error:', error);
            });
        }
      });
    });
  });
};

function generateRandomValue(oldValue, min, max) {
  var newValue;

  if (oldValue) {
    // generate a new value using the old value as base
    var sign = Date.now() % 2;
    var variance = Date.now() % 3;
    if (sign === 0) {
      newValue = parseInt(oldValue) + variance;
      newValue = newValue > max ? max : newValue;
    } else {
      newValue = parseInt(oldValue) - variance;
      newValue = newValue < min ? min : newValue;
    }
  } else {
    newValue = Date.now() % max;
  }
  return newValue;
}

// Load restaurant data from Orion
var loadRestaurantData = function() {

  // Generate the sensors once we have all restaurant data
  var processRestaurants = function(data) {
    restaurantsData = JSON.parse(JSON.stringify(data.body));
    feedIDASSensors();
  };

  utils.getListByType('Restaurant', null, fiwareHeaders)
  .then(processRestaurants)
  .catch(function(err) {
    console.log(err);
  });
};

console.log('Updating restaurant sensors...');

loadRestaurantData();
