/*
 * restaurantsspec.js
 * Copyright(c) 2015 Bitergia
 * Author: Alberto Martín <alberto.martin@bitergia.com>
 * MIT Licensed
 */

// jshint node: true
// jshint jasmine: true

'use strict';

var frisby = require('frisby');
var delay = 200; //miliseconds
var config = require('../config');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var oauthTokenUrl = config.idmUrl + '/oauth2/token';
var username = 'user0@test.com';
var password = 'test';
var auth = 'Basic ' +
  new Buffer(config.clientId + ':' + config.clientSecret).toString(
    'base64');

frisby.create('OAuth2 login')
  .addHeader('Authorization', auth)
  .addHeader('Content-Type', 'application/x-www-form-urlencoded')
  .post(oauthTokenUrl, {
    // jshint camelcase: false
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    grant_type: 'password',
    username: username,
    password: password,
    client_id: config.clientId,
    client_secret: config.clientSecret
  })
  .expectStatus(200)
  .after(function(err, res, body) {
    var token = JSON.parse(body).access_token;
    // jshint camelcase: true
    // jscs:enable
    frisby.create('Post JSON to /api/orion/restaurant')
      .post('http://tourguide/api/orion/restaurant', {
        '@type': 'Restaurant',
        'name': 'example',
        'address': {
          '@type': 'postalAddress',
          'streetAddress': 'Av. de la Universidad 30',
          'addressLocality': 'Leganes',
          'addressRegion': 'Madrid',
          'postalCode': 28911
        },
        'department': 'Franchise4',
        'description': 'Restaurant description',
        'priceRange': '25.0',
        'telephone': '912345678',
        'url': 'http://www.example.com',
        'capacity': {
          'type': 'PropertyValue',
          'name': 'capacity',
          'value': 200
        },
        'occupancyLevels': {
          'type': 'PropertyValue',
          'timestamp': new Date().getTime(),
          'name': 'occupancyLevels',
          'value': 0
        }
      }, {
        json: true
      })
      .addHeader('X-Auth-Token', token)
      .addHeader('fiware-service', 'tourguide')
      .addHeader('fiware-servicepath', '/Franchise4')
      .waits(delay)
      .expectStatus(201)
      .expectHeaderContains('location',
        '/api/orion/restaurant/example')
      .toss();

    frisby.create('List all the restaurants')
      .get('http://tourguide/api/orion/restaurants')
      .addHeader('X-Auth-Token', token)
      .addHeader('fiware-service', 'tourguide')
      .waits(delay)
      .expectStatus(200)
      .expectHeaderContains('content-type', 'application/json')
      .expectJSON('*', {
        '@context': 'http://schema.org',
        '@type': 'Restaurant',
        address: {
          '@type': 'postalAddress'
        }
      })
      .toss();

    frisby.create('Get a Restaurant')
      .get('http://tourguide/api/orion/restaurant/example')
      .addHeader('X-Auth-Token', token)
      .addHeader('fiware-service', 'tourguide')
      .waits(delay)
      .expectStatus(200)
      .expectHeaderContains('content-type', 'application/json')
      .expectJSON('*', {
        '@context': 'http://schema.org',
        '@type': 'Restaurant',
        address: {
          '@type': 'postalAddress'
        }
      })
      .toss();

    frisby.create('Get a Restaurant that does not exist')
      .get('http://tourguide/api/orion/restaurant/fail')
      .addHeader('X-Auth-Token', token)
      .addHeader('fiware-service', 'tourguide')
      .waits(delay)
      .expectStatus(404)
      .expectHeaderContains('content-type', 'application/json')
      .expectJSON({
        error: 'NotFound',
        // jshint maxlen: 100
        // jscs:disable maximumLineLength
        description: 'The requested entity has not been found. Check type and id'
        // jshint maxlen: 80
        // jscs:enable
      })
      .toss();

    frisby.create('Patch a Restaurant')
      .patch('http://tourguide/api/orion/restaurant/example', {
        'url': 'http://www.example.com'
      }, {
        json: true
      })
      .addHeader('X-Auth-Token', token)
      .addHeader('fiware-service', 'tourguide')
      .addHeader('fiware-servicepath', '/Franchise4')
      .waits(delay)
      .expectStatus(204)
      .toss();

    frisby.create('Patch a Restaurant that does not exist')
      .patch('http://tourguide/api/orion/restaurant/fail', {
        'url': 'http://www.example.com'
      }, {
        json: true
      })
      .addHeader('X-Auth-Token', token)
      .addHeader('fiware-service', 'tourguide')
      .waits(delay)
      .expectStatus(404)
      .expectHeaderContains('content-type', 'application/json')
      .expectJSON({
        error: 'NotFound',
        description: 'No context element found'
      })
      .toss();

    frisby.create('Delete a Restaurant')
      .delete('http://tourguide/api/orion/restaurant/example')
      .addHeader('X-Auth-Token', token)
      .addHeader('fiware-service', 'tourguide')
      .addHeader('fiware-servicepath', '/Franchise4')
      .waits(delay)
      .expectStatus(204)
      .toss();

    frisby.create('Delete a Restaurant that does not exist')
      .delete('http://tourguide/api/orion/restaurant/fail')
      .addHeader('X-Auth-Token', token)
      .addHeader('fiware-service', 'tourguide')
      .waits(delay)
      .expectStatus(404)
      .expectHeaderContains('content-type', 'application/json')
      .expectJSON({
        error: 'NotFound',
        // jshint maxlen: 100
        // jscs:disable maximumLineLength
        description: 'The requested entity has not been found. Check type and id'
        // jshint maxlen: 80
        // jscs:enable
      })
      .toss();

    frisby.create('List all the restaurants of Franchise1')
      .get(
        'http://tourguide/api/orion/restaurants/organization/Franchise1'
      )
      .addHeader('X-Auth-Token', token)
      .addHeader('fiware-service', 'tourguide')
      .waits(delay)
      .expectStatus(200)
      .expectHeaderContains('content-type', 'application/json')
      .expectJSON('*', {
        'department': 'Franchise1'
      })
      .toss();
  })
  .toss();
