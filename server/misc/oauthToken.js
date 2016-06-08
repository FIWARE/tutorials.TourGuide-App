/*
 * oauthToken.js
 * Copyright(c) 2015 Bitergia
 * Author: Alberto Martín <alberto.martin@bitergia.com>
 * MIT Licensed
 *
 * Simple script that retrieves an oauth Token from IDM
 *
 */

// jshint node: true, jasmine: true

'use strict';

var config = require('../config');
var rp = require('request-promise');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var oauthTokenUrl = config.idmUrl + '/oauth2/token';
var username = process.argv[2];
var password = process.argv[3];
var auth = 'Basic ' +
  new Buffer(config.clientId + ':' + config.clientSecret).toString('base64');

var options = {
  method: 'POST',
  uri: oauthTokenUrl,
  headers: {
    'Authorization': auth,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  form: {
    // jshint camelcase: false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    grant_type: 'password',
    username: username,
    password: password,
    client_id: config.clientId,
    client_secret: config.clientSecret
    // jshint camelcase: true
    // jscs:enable
  }
};

rp(options)
  .then(function(data) {
    console.log(data);
  })
  .catch(function(err) {
    console.error(err.error);
  });
