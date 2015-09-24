/*jshint node:true */
/*jshint maxlen: 100 */
'use strict';
var http = require('http');
var querystring = require('querystring');
var config = require('./config');
var host = 'compose_orion_1'; // To be changed to PEP for auth
var port = 1026;

module.exports = performRequest;

function performRequest(endpoint, method, data, success) {
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
      'Content-Length': dataString.length
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
          console.log('Response', res.statusCode, 'OK');
          responseObject = JSON.parse(responseString);
          success(responseObject);

        } else if (res.statusCode == 404) {
          console.log('Response', res.statusCode, 'NOT FOUND');
          responseObject = JSON.parse(responseString);
          success(responseObject);

        } else {
          console.log('The returned object is empty');
        }

      } else if (method == 'POST') {

        if (res.statusCode == 201) {
          console.log('Response', res.statusCode, 'OK');
          console.log(res.headers.location);
          success(res);
        } else if (res.statusCode == 204) {
          console.log('Response', res.statusCode, 'OK');
          console.log(res.headers);
          success(res);
        } else {
          console.log('Response', res.statusCode, 'NOT HANDLED YET');
          console.log(res.headers);
          success(res);
        }
      } else if (method == 'PATCH') {
        if (res.statusCode == 204) {
          console.log('Response', res.statusCode, 'OK');
          console.log(res.headers);
          success(res);

        } else {
          console.log('Response', res.statusCode, 'NOT HANDLED YET');
          success(res);
        }
      } else if (method == 'PUT') {
        if (res.statusCode == 200 || res.statusCode == 204) {
          console.log('Response', res.statusCode, 'OK');
          console.log(res.headers);
          success(res);
        } else {
          console.log('Response', res.statusCode, 'NOT HANDLED YET');
          success(res);
        }
      } else if (method == 'DELETE') {
        if (res.statusCode == 204) {
          console.log('Response', res.statusCode, 'OK');
          console.log(res.headers);
          success(res);
        } else {
          console.log('Response', res.statusCode, 'NOT HANDLED YET');
          success(res);
        }
      } else {
        console.log(res.headers);
        console.log('No data to show');
        success(res);
      }
    });
  });

  req.write(dataString);
  req.end();
}