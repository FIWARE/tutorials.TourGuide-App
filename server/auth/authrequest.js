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
var qString = require('querystring');
var Q = require('q');
var config = require('../config');
var host = 'http://orion'; // To be changed to PEP for auth
var port = 1026;

module.exports = performRequest;

/**
 * Helper function to perform requests against Orion
 *
 * @param {Object} endpoint - Endpoint to perform the request
 * @param {Object} method - HTTP method to use
 * @param {Object} data - Data to send
 * @param {Object} fiwareHeaders - Headers to use
 * @param {Object} querystring - querystring data
 * @return {Promise} promise with the result of the request
*/
function performRequest(endpoint, method, data, fiwareHeaders, querystring) {
  var deferred = Q.defer();
  var headers = {};

  if (fiwareHeaders) {
    if (fiwareHeaders['fiware-service']) {
      headers['fiware-service'] = fiwareHeaders['fiware-service'];
    }
    if (fiwareHeaders['fiware-servicepath']) {
      headers['fiware-servicepath'] = fiwareHeaders['fiware-servicepath'];
    }
  }

  var options = {
    uri: host + ':' + port + endpoint,
    headers: headers,
    resolveWithFullResponse: true,
    json: true // Automatically parses the JSON string in the response
  };

  if (querystring) {
    endpoint += '?' + qString.stringify(querystring);
    options.uri = host + ':' + port + endpoint;
  }

  switch (method) {
    case 'GET':
      options.method = 'GET';
      break;
    case 'POST':
      options.method = 'POST';
      options.body = data;
      break;
    case 'PATCH':
      options.method = 'PATCH';
      options.body = data;
      break;
    case 'DELETE':
      options.method = 'DELETE';
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
