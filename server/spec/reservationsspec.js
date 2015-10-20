/*
 * reservationsspec.js
 * Copyright(c) 2015 Bitergia
 * Author: Alberto Martín <alberto.martin@bitergia.com>
 * MIT Licensed
 */

// jshint node: true

'use strict';

var frisby = require('frisby');

frisby.create('Post JSON to /api/orion/reservation')
  .post('http://compose_devguide_1/api/orion/reservation', {
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
  .expectStatus(201)
  .after(function(err, res, body) {
    var location = res.headers.location;

    frisby.create('Get a Reservation')
      .get('http://compose_devguide_1' + location)
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
      .patch('http://compose_devguide_1' + location, {
        'partySize': '10'
      }, {
        json: true
      })
      .expectStatus(204)
      .toss();

    frisby.create('Delete a Reservation')
      .delete('http://compose_devguide_1' + location)
      .expectStatus(204)
      .toss();
  })
  .toss();

frisby.create('Get a Reservation that does not exist')
  .get('http://compose_devguide_1/api/orion/reservation/fail')
  .expectStatus(404)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON({
    error: 'NotFound',
    description: 'The requested entity has not been found. Check type and id'
  })
  .toss();

frisby.create('Patch a Reservation that does not exist')
  .patch('http://compose_devguide_1/api/orion/reservation/fail', {
    'partySize': 'fail!'
  }, {
    json: true
  })
  .expectStatus(404)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON({
    error: 'NotFound',
    description: 'No context element found'
  })
  .toss();

frisby.create('Delete a Reservation that does not exist')
  .delete('http://compose_devguide_1/api/orion/reservation/fail')
  .expectStatus(404)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON({
    error: 'NotFound',
    description: 'The requested entity has not been found. Check type and id'
  })
  .toss();

frisby.create('List all the reservations')
  .get('http://compose_devguide_1/api/orion/reservations')
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
    'http://compose_devguide_1/api/orion/reservations/user/user1')
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
    'http://compose_devguide_1/api/orion/reservations/restaurant/Araba')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('*', {
    reservationFor: {
      '@type': 'FoodEstablishment',
      name: 'Araba'
    }
  })
  .toss();
