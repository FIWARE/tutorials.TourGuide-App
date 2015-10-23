/*
 * reservationsspec.js
 * Copyright(c) 2015 Bitergia
 * Author: Alberto Martín <alberto.martin@bitergia.com>
 * MIT Licensed
 */

// jshint node: true
// jshint jasmine: true

'use strict';

var frisby = require('frisby');
var delay = 200; //miliseconds

frisby.create('Post JSON to /api/orion/reservation')
  .post('http://devguide/api/orion/reservation', {
    '@type': 'FoodEstablishmentReservation',
    partySize: 5,
    reservationFor: {
      '@type': 'FoodEstablishment',
      name: 'Araba'
    },
    startTime: '2015-12-24T10:12:23.396Z'
  }, {
    json: true
  })
  .waits(delay)
  .expectStatus(201)
  .after(function(err, res, body) {
    var location = res.headers.location;

    frisby.create('Get a Reservation')
      .get('http://devguide' + location)
      .waits(delay)
      .expectStatus(200)
      .expectHeaderContains('content-type', 'application/json')
      .expectJSON('*', {
        '@context': 'http://schema.org',
        '@type': 'FoodEstablishmentReservation',
        reservationFor: {
          '@type': 'FoodEstablishment',
          name: 'Araba',
          address: {
            '@type': 'postalAddress'
          }
        },
        underName: {
          '@type': 'Person'
        }
      })
      .toss();

    frisby.create('Patch a Reservation')
      .patch('http://devguide' + location, {
        'partySize': '10'
      }, {
        json: true
      })
      .waits(delay)
      .expectStatus(204)
      .toss();

    frisby.create('Delete a Reservation')
      .delete('http://devguide' + location)
      .waits(delay)
      .expectStatus(204)
      .toss();
  })
  .toss();

frisby.create('Get a Reservation that does not exist')
  .get('http://devguide/api/orion/reservation/fail')
  .waits(delay)
  .expectStatus(404)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON({
    error: 'NotFound',
    description: 'The requested entity has not been found. Check type and id'
  })
  .toss();

frisby.create('Patch a Reservation that does not exist')
  .patch('http://devguide/api/orion/reservation/fail', {
    'partySize': 'fail!'
  }, {
    json: true
  })
  .waits(delay)
  .expectStatus(404)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON({
    error: 'NotFound',
    description: 'No context element found'
  })
  .toss();

frisby.create('Delete a Reservation that does not exist')
  .delete('http://devguide/api/orion/reservation/fail')
  .waits(delay)
  .expectStatus(404)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON({
    error: 'NotFound',
    description: 'The requested entity has not been found. Check type and id'
  })
  .toss();

frisby.create('List all the reservations')
  .get('http://devguide/api/orion/reservations')
  .waits(delay)
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('*', {
    '@context': 'http://schema.org',
    '@type': 'FoodEstablishmentReservation',
    reservationFor: {
      '@type': 'FoodEstablishment'
    },
    underName: {
      '@type': 'Person'
    }
  })
  .toss();

frisby.create('List all the Reservations of a user')
  .get(
    'http://devguide/api/orion/reservations/user/user1')
  .waits(delay)
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('*', {
    'underName': {
      '@type': 'Person',
      'name': 'user1'
    }
  })
  .toss();

frisby.create('List all the Reservations of a restaurant')
  .get(
    'http://devguide/api/orion/reservations/restaurant/Araba')
  .waits(delay)
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('*', {
    reservationFor: {
      '@type': 'FoodEstablishment',
      name: 'Araba'
    }
  })
  .toss();
