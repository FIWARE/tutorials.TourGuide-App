/*
 * idasul20.js
 * Copyright(c) 2015 Bitergia
 * Author: David Muriel <dmuriel@bitergia.com>
 * MIT Licensed
*/

// jshint node: true

'use strict';

var http = require('http');
var Q = require('q');
var config = require('../config');
var utils = require('../utils');
var idasHostname = config.idasHostname;
var idasPort = config.idasPort;
var idasAdminPort = config.idasAdminPort;
var idasFiwareService = config.idasFiwareService;
var idasFiwareServicePath = config.idasFiwareServicePath;
var idasApiKey = config.idasApiKey;
var orionHostname = config.idasContextBrokerHostname;
var orionPort = config.orionPort;
var TEMPERATURE = '25';
var RELATIVEHUMIDITY = '0.2';

var defaultHeaders = {
  'content-type': 'application/json',
  'x-auth-token': 'NULL',
  'fiware-service': idasFiwareService,
  'fiware-servicepath': idasFiwareServicePath
};

var sensorsTemplates = {
  'temperature': {
    'devices': [
      {'device_id': 'DEV_ID',
       'entity_name': 'ENTITY_ID',
       'protocol': 'UL20',
       'entity_type': 'Restaurant',
       'timezone': 'Europe/Madrid',
       'attributes': [
         {'object_id': 't',
           'name': 'temperature',
           'type': 'Number'
         }]
      }
    ]
  },
  'relativeHumidity': {
    'devices': [
      {'device_id': 'DEV_ID',
       'entity_name': 'ENTITY_ID',
       'protocol': 'UL20',
       'entity_type': 'Restaurant',
       'timezone': 'Europe/Madrid',
       'attributes': [
         {'object_id': 'h',
           'name': 'relativeHumidity',
           'type': 'Number'
         }]
      }
    ]
  }
};

/**
 * Creates a new service in the IoT Agent.
 *
 * @return {Promise} response of the IoT Agent.
*/
function createService() {
  var idasUrl = '/iot/services';
  var headers = JSON.parse(JSON.stringify(defaultHeaders));
  var RESOURCE = '/iot/d';

  // build payload
  var data = {
    'services': [
      {
        'apikey': '' + idasApiKey + '',
        'cbroker': 'http://' + orionHostname + ':' + orionPort + '',
        'resource': RESOURCE
      }
    ]
  };

  var dataString = JSON.stringify(data);

  var options = {
    host: idasHostname,
    port: idasAdminPort,
    path: idasUrl,
    method: 'POST',
    headers: headers
  };

  var q = Q.defer();
  var req = http.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(chunk) {
      responseString += chunk;
    });

    res.on('end', function() {
      if (res.statusCode == 201) {
        console.log('Registered new service: ' + idasFiwareService);
        q.resolve(responseString);
      } else if (res.statusCode == 409 &&
                 (responseString !== '[]' && responseString !== '{}')) {
        console.log('Service ' + idasFiwareService + ' is already registered.');
        q.resolve(responseString);
      } else {
        console.log('Response code:', res.statusCode);
        console.log('Response headers:', res.headers);
        console.log('Response data:', responseString);
        q.reject(responseString);
      }
    });
  });

  req.on('error', function(error) {
    console.error('Error on request: ' + error.message);
    q.reject(error);
  });

  // Perform request
  req.write(dataString);
  req.end();
  return q.promise;
}

/**
 * Register a new sensor for a restaurant in the IoT Agent.
 *
 * @param {Object} restaurant - Restaurant entity.
 * @param {String} room - The room where the sensor will be locaed.
 * @param {String} type - The type of the new sensor.
 * @return {Promise} Response of the IoT Agent.
*/
function registerSensor(restaurant, room, type) {
  var idasUrl = '/iot/devices';
  var headers = JSON.parse(JSON.stringify(defaultHeaders));
  var deviceId = getDeviceId(restaurant, room, type);

  // Build payload
  var data = sensorsTemplates[type];
  // jshint camelcase: false
  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  data.devices[0].device_id = deviceId;
  data.devices[0].entity_name = restaurant.id;
  data.devices[0].attributes[0].name = type + ':' + room;
  // jshint camelcase: true
  // jscs:enable requireCamelCaseOrUpperCaseIdentifiers

  var dataString = JSON.stringify(data);
  headers = utils.completeHeaders(headers, restaurant.department);

  var options = {
    host: idasHostname,
    port: idasAdminPort,
    path: idasUrl,
    method: 'POST',
    headers: headers
  };

  var q = Q.defer();
  var req = http.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      var responseObject;
      if (responseString !== '') {
        responseObject = JSON.parse(responseString);
      }
      if (res.statusCode == 201) {
        console.log('Registered new device: ' + deviceId);
        q.resolve(responseString);
      } else if (
        res.statusCode == 409 &&
        responseObject.reason == 'There are conflicts, entity already exists') {
        console.error('Device', deviceId, 'already exists.');
        q.resolve(responseString);
      } else {
        console.error('Response code:', res.statusCode);
        console.error('Response headers:', res.headers);
        console.error('Response data:', responseString);
        q.reject(responseString);
      }
    });
  });

  req.on('error', function(error) {
    console.error('Error on request: ' + error.message);
    q.reject(error);
  });

  // Perform request
  req.write(dataString);
  req.end();
  return q.promise;
}

/**
 * Send a new measurement for a single sensor.
 *
 * @param {String} deviceId - Id of the sensor in the IoT Agent.
 * @param {String} data - The measurement data.
 * @param {String} servicePath - The servicePath of the sensor.
 * @return {Promise} Response of the IoT Agent.
*/
function sendObservation(deviceId, data, servicePath) {
  var idasUrl = '/iot/d';
  var headers = JSON.parse(JSON.stringify(defaultHeaders));
  var idasParams = [
    'k=' + idasApiKey,
    'i=' + encodeURIComponent(deviceId)
  ];

  headers['content-type'] = 'text/plain';
  headers = utils.completeHeaders(headers, servicePath);

  var options = {
    host: idasHostname,
    port: idasPort,
    path: idasUrl + '?' + idasParams.join('&'),
    method: 'POST',
    headers: headers
  };

  var q = Q.defer();
  var req = http.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      var responseObject;
      if (responseString !== '') {
        responseObject = JSON.parse(responseString);
      }
      if (res.statusCode == 200) {
        q.resolve(responseString);
      } else {
        console.error('Request:', options);
        console.error('Response code:', res.statusCode);
        console.error('Response headers:', res.headers);
        console.error('Response data:', responseString);
        q.reject(responseString);
      }
    });
  });

  req.on('error', function(error) {
    console.error('Error on request: ' + error.message);
    q.reject(error);
  });

  // Perform request
  req.write(data);
  req.end();
  return q.promise;
}

/**
 * Send a temperature measurement.
 *
 * @param {String} deviceId - Id of the sensor in the IoT Agent.
 * @param {String} value - The temperature value.
 * @param {String} servicePath - The servicePath of the sensor.
 * @return {Promise} Response of the IoT Agent.
*/
function updateTemperatureSensor(deviceId, value, servicePath) {
  return sendObservation(deviceId, 't|' + value, servicePath)
    .then(function(res) {
      console.log('Updated temperature for ' + deviceId + ': ' + value);
    });
}

/**
 * Send a relative humidity measurement.
 *
 * @param {String} deviceId - Id of the sensor in the IoT Agent.
 * @param {String} value - The relative humidity value.
 * @param {String} servicePath - The servicePath of the sensor.
 * @return {Promise} Response of the IoT Agent.
*/
function updateRelativeHumiditySensor(deviceId, value, servicePath) {
  return sendObservation(deviceId, 'h|' + value, servicePath)
    .then(function(res) {
      console.log('Updated relative humidity for ' + deviceId + ': ' + value);
    });
}

/**
 * Initialize a sensor with a default value.
 *
 * @param {Object} restaurant - Restaurant entity.
 * @param {String} room - The room where the sensor will be locaed.
 * @param {String} type - The type of the new sensor.
 * @return {Promise} Response of the IoT Agent.
*/
function initializeSensor(restaurant, room, type) {
  var deviceId = getDeviceId(restaurant, room, type);
  switch (type) {
    case 'temperature':
      return updateTemperatureSensor(deviceId, TEMPERATURE,
                                     restaurant.department);
    case 'relativeHumidity':
      return updateRelativeHumiditySensor(deviceId, RELATIVEHUMIDITY,
                                          restaurant.department);
    default:
      return Q.reject('Unsupported sensor type: ' + type);
  }
}

/**
 * Send a new measurement for a sensor.
 *
 * @param {String} deviceId - Id of the sensor in the IoT Agent.
 * @param {String} type - The sensor type.
 * @param {String} value - The measurement value.
 * @param {String} servicePath - The servicePath of the sensor.
 * @return {Promise} Response of the IoT Agent.
*/
function updateSensor(deviceId, type, value, servicePath) {
  switch (type) {
    case 'temperature':
      return updateTemperatureSensor(deviceId, value, servicePath);
    case 'relativeHumidity':
      return updateRelativeHumiditySensor(deviceId, value, servicePath);
    default:
      return Q.reject('Unsupported sensor type: ' + type);
  }
}

/**
 * Generate a deviceId for a sensor.
 *
 * @param {Object} restaurant - Restaurant entity of the sensor.
 * @param {String} room - The room where the sensor will be locaed.
 * @param {String} type - The type of the new sensor.
 * @return {String} deviceId of the sensor.
*/
function getDeviceId(restaurant, room, type) {
  return restaurant.id + '-' + room + '-' + type;
}

module.exports = {
  createService: createService,
  registerSensor: registerSensor,
  sendObservation: sendObservation,
  initializeSensor: initializeSensor,
  updateTemperatureSensor: updateTemperatureSensor,
  updateRelativeHumiditySensor: updateRelativeHumiditySensor,
  updateSensor: updateSensor,
  getDeviceId: getDeviceId
};
