/* jshint node:true */
/* jshint maxlen: 80 */
'use strict';
var rp = require('request-promise');
var querystring = require('querystring');
var Q = require('q');
var config = require('./config');
var host = 'http://compose_orion_1'; // To be changed to PEP for auth
var port = 1026;

module.exports = performRequest;

function performRequest(endpoint, method, data) {

  var deferred = Q.defer();
  var headers;
  var options;

  switch (method) {
  case 'GET':
    endpoint += '?' + querystring.stringify(data);
    options = {
      uri: host + ':' + port + endpoint,
      headers: {
        'User-Agent': 'Request-Promise'
      },
      resolveWithFullResponse: true,
      json: true // Automatically parses the JSON string in the response
    };
    break;
  case 'POST':
    options = {
      method: 'POST',
      uri: host + ':' + port + endpoint,
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
      resolveWithFullResponse: true
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
