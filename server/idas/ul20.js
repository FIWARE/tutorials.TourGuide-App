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
var idasHostname = config.idasHostname;
var idasPort = config.idasPort;
var idasFiwareService = config.idasFiwareService;
var idasFiwareServicePath = config.idasFiwareServicePath;
var idasApiKey = config.idasApiKey;
var orionHostname = config.idasContextBrokerHostname;
var orionPort = config.orionPort;

var defaultHeaders = {
  'Content-Type': 'application/json',
  'X-Auth-Token': 'NULL',
  'Fiware-Service': idasFiwareService,
  'Fiware-ServicePath': idasFiwareServicePath
};

var sensorsTemplates = {
  'SENSOR_TEMP': {
    'devices': [
      {'device_id': 'DEV_ID',
       'entity_name': 'ENTITY_ID',
       'protocol': 'PDI-IoTA-UltraLight',
       'entity_type': 'thing',
       'timezone': 'Europe/Madrid',
       'attributes': [
         {'object_id': 't',
           'name': 'temperature',
           'type': 'int'
         }],
       'static_attributes': [
         {'name': 'att_name',
           'type': 'string',
           'value': 'value'
         }
       ]
      }
    ]
  },
  'SENSOR_HUM': {
    'devices': [
      {'device_id': 'DEV_ID',
       'entity_name': 'ENTITY_ID',
       'protocol': 'PDI-IoTA-UltraLight',
       'entity_type': 'thing',
       'timezone': 'Europe/Madrid',
       'attributes': [
         {'object_id': 'h',
           'name': 'humidity',
           'type': 'int'
         }],
       'static_attributes': [
         {'name': 'att_name',
           'type': 'string',
           'value': 'value'
         }
       ]
      }
    ]
  }
};

function createService() {
  var idasUrl = '/iot/services';
  var headers = defaultHeaders;

  // build payload
  var data = {
    'services': [
      {
        'apikey': '' + idasApiKey + '',
        'token': 'token2',
        'cbroker': 'http://' + orionHostname + ':' + orionPort + '',
        'entity_type': 'thing',
        'resource': '/iot/d'
      }
    ]
  };

  var dataString = JSON.stringify(data);
  headers['Content-Length'] = dataString.length;

  var options = {
    host: idasHostname,
    port: idasPort,
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
    console.log('Error on request: ' + error.message);
    q.reject(error);
  });

  // perform request
  req.write(dataString);
  req.end();
  return q.promise;
}

function registerSensor(name, type) {
  var idasUrl = '/iot/devices';
  var headers = defaultHeaders;
  var entityName = type + '_' + encodeURIComponent(name);

  // build payload
  var data = sensorsTemplates[type];
  // jshint camelcase: false
  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  data.devices[0].device_id = entityName;
  data.devices[0].entity_name = entityName;
  // jshint camelcase: true
  // jscs:enable requireCamelCaseOrUpperCaseIdentifiers

  var dataString = JSON.stringify(data);
  headers['Content-Length'] = dataString.length;

  var options = {
    host: idasHostname,
    port: idasPort,
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
        console.log('Registered new device: ' + entityName);
        q.resolve(responseString);
      } else if (
        res.statusCode == 409 &&
        responseObject.reason == 'There are conflicts, entity already exists') {
        console.log('Device', entityName, 'already exists.');
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
    console.log('Error on request: ' + error.message);
    q.reject(error);
  });

  // perform request
  req.write(dataString);
  req.end();
  return q.promise;
}

function sendObservation(name, type, data) {
  var idasUrl = '/iot/d';
  var headers = defaultHeaders;
  var entityName = type + '_' + encodeURIComponent(name);
  var idasParams = [
    'k=' + idasApiKey,
    'i=' + encodeURIComponent(entityName)
  ];

  headers['Content-Length'] = data.length;

  var options = {
    host: idasHostname,
    port: idasPort,
    path: idasUrl + '?' + idasParams.join('&'),
    method: 'POST',
    headers: headers
  };

  // console.log('options:', options);
  // console.log('data:', data);

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
        //console.log('Measurement sent: ' + entityName + ' ' + data);
        q.resolve(responseString);
      } else {
        console.log('Request:', options);
        console.log('Response code:', res.statusCode);
        console.log('Response headers:', res.headers);
        console.log('Response data:', responseString);
        q.reject(responseString);
      }
    });
  });

  req.on('error', function(error) {
    console.log('Error on request: ' + error.message);
    q.reject(error);
  });

  // perform request
  req.write(data);
  req.end();
  return q.promise;
}

function updateTemperatureSensor(name, value) {
  return sendObservation(name, 'SENSOR_TEMP', 't|' + value)
    .then(function(res) {
      console.log('Updated temperature for ' + name + ': ' + value);
    });
}

function updateHumiditySensor(name, value) {
  return sendObservation(name, 'SENSOR_HUM', 'h|' + value)
    .then(function(res) {
      console.log('Updated humidity for ' + name + ': ' + value);
    });
}

function initializeSensor(name, type) {
  switch (type) {
  case 'SENSOR_TEMP':
    return updateTemperatureSensor(name, '25');
  case 'SENSOR_HUM':
    return updateHumiditySensor(name, '20');
  default:
    return Q.reject('Unsupported sensor type: ' + type);
  }
}

function updateSensor(name, type, value) {
  switch (type) {
  case 'SENSOR_TEMP':
    return updateTemperatureSensor(name, value);
  case 'SENSOR_HUM':
    return updateHumiditySensor(name, value);
  default:
    return Q.reject('Unsupported sensor type: ' + type);
  }
}

module.exports = {
  createService: createService,
  registerSensor: registerSensor,
  sendObservation: sendObservation,
  initializeSensor: initializeSensor,
  updateTemperatureSensor: updateTemperatureSensor,
  updateHumiditySensor: updateHumiditySensor,
  updateSensor: updateSensor
};
