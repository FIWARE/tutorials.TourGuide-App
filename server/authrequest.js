/*jshint node:true */
/*jshint maxlen: 100 */
'use strict';
var http = require('http');
var querystring = require('querystring');
var config = require('./config');
var host = 'compose_orion_1'; // To be changed to PEP for auth
var port = 1026;

module.exports = performRequest;

function performRequest(endpoint, method, data, callback) {
  /*jshint camelcase: false */
  
  var dataString = JSON.stringify(data);
  var headers = {};

  if (typeof session !== 'undefined' && typeof req.session.access_token !== 'undefined') {
    headers = {
      'X-Auth-Token': req.session.access_token
    };

  } else {
    headers = {};
  }

  if (method == 'GET') {
    endpoint += '?' + querystring.stringify(data);
  } else {
    headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(dataString, 'utf-8')
    };
  }

  var options = {
    host: host,
    port: port,
    path: endpoint,
    method: method,
    headers: headers
  };

  var req = http.request(options, function (res) {
    res.setEncoding('utf-8');

    var responseString = '';

    req.on('error', function (error) {
      console.log('problem with request: ' + error.message);
    });

    res.on('data', function (data) {
      responseString += data;
    });

    res.on('end', function () {
      if (method == 'GET') {
        var responseObject;
        if (res.statusCode == 200 && (responseString !== '[]' && responseString !== '{}')) {
          responseObject = JSON.parse(responseString);
          callback(null, responseObject);
        } else {
          callback(new Error(res.statusCode));
        }

      } else if (method == 'POST') {

        if (res.statusCode == 201) {
          console.log('Response', res.statusCode, 'OK');
          console.log(res.headers.location);
          callback(null, res.statusCode);
        } else if (res.statusCode == 204) {
          console.log('Response', res.statusCode, 'OK');
          console.log(res.headers);
          callback(null, res.statusCode);
        } else {
          callback(new Error(res.statusCode));
        }
      } else if (method == 'PATCH') {
        if (res.statusCode == 204) {
          console.log('Response', res.statusCode, 'OK');
          console.log(res.headers);
          callback(null, res.statusCode);
        } else {
          console.log('Response', res.statusCode, 'NOT HANDLED YET');
          callback(new Error(res.statusCode));
        }
      } else if (method == 'PUT') {
        if (res.statusCode == 200 || res.statusCode == 204) {
          console.log('Response', res.statusCode, 'OK');
          console.log(res.headers);
          callback(null, res.statusCode);
        } else {
          console.log('Response', res.statusCode, 'NOT HANDLED YET');
          callback(new Error(res.statusCode));
        }
      } else if (method == 'DELETE') {
        if (res.statusCode == 204) {
          console.log('Response', res.statusCode, 'OK');
          console.log(res.headers);
          callback(null, res.statusCode);
        } else {
          console.log('Response', res.statusCode, 'NOT HANDLED YET');
          callback(new Error(res.statusCode));
        }
      } else {
        console.log(res.headers);
        console.log('No data to show');
        callback(responseString);
      }
    });
  });

  req.write(dataString);
  req.end();
}