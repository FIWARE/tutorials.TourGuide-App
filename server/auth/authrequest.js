/*
 * authrequest.js
 * Copyright(c) 2016 Bitergia
 * Author: Bitergia <fiware-testing@bitergia.com>
 * MIT Licensed
 * 
 * Request builder for consuming Orion NGSIv2 API
 * 
 */


// jshint node: true

'use strict';

var rp = require('request-promise');
var querystring = require('querystring');
var Q = require('q');
var config = require('../config');
var host = 'http://orion'; // To be changed to PEP for auth
var port = 1026;

module.exports = performRequest;

function performRequest(endpoint, method, data, fiwareHeaders) {

  var deferred = Q.defer();
  var headers = {};
  var options;
  if (typeof fiwareHeaders !== 'undefined') {
    if (typeof fiwareHeaders['fiware-service'] !== 'undefined') {
      headers['fiware-service'] = fiwareHeaders['fiware-service'];
    }
    if (typeof fiwareHeaders['fiware-servicepath'] !== 'undefined') {
      headers['fiware-servicepath'] = fiwareHeaders['fiware-servicepath'];
    }
  }
  switch (method) {
  case 'GET':
    endpoint += '?' + querystring.stringify(data);
    headers['User-Agent'] = 'Request-Promise';
    options = {
      uri: host + ':' + port + endpoint,
      headers: headers,
      resolveWithFullResponse: true,
      json: true // Automatically parses the JSON string in the response
    };
    break;
  case 'POST':
    options = {
      method: 'POST',
      uri: host + ':' + port + endpoint,
      headers: headers,
      body: data,
      resolveWithFullResponse: true,
      json: true // Automatically stringifies the body to JSON
    };
    break;
  case 'PATCH':
    endpoint += '?' + querystring.stringify(data);
    options = {
      method: 'PATCH',
      uri: host + ':' + port + endpoint,
      headers: headers,
      body: data,
      resolveWithFullResponse: true,
      json: true
    };
    break;
  case 'DELETE':
    endpoint += '?' + querystring.stringify(data);
    options = {
      method: 'DELETE',
      uri: host + ':' + port + endpoint,
      headers: headers,
      resolveWithFullResponse: true,
      json: true
    };
    break;
  default:
    deferred.reject('The requested method is not available');
  }

  var req = rp(options)
      .then(function(res) {
        return deferred.resolve(res);
      })
      .catch(function(error) {
        return deferred.reject(error);
      });

  return deferred.promise;
}
