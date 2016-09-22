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
var config = require('../config');
var RESERVATION_TYPE = 'FoodEstablishmentReservation';
var POSTAL_ADDRESS_TYPE = 'PostalAddress';
var PERSON_TYPE = 'Person';
var FOOD_ESTABLISHMENT_TYPE = 'FoodEstablishment';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var oauthTokenUrl = config.idmUrl + '/oauth2/token';
var username = 'user1@test.com';
var password = 'test';
var reservationDate = '2015-12-24T10:12:23.396Z';
var auth = 'Basic ' +
  new Buffer(config.clientId + ':' + config.clientSecret).toString('base64');
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
    frisby.create('Post JSON to /api/orion/restaurant')
      .post('http://tourguide/api/orion/restaurant', {
        type: 'Restaurant',
        id: '34f036f9eef1f403c0ea66c55b8cdbace4b5f7a6',
        address: {
          type: 'PostalAddress',
          value: {
            streetAddress: 'Avenida de los Huetos, 17',
            addressRegion: 'ALAVA',
            addressLocality: 'ALI',
            postalCode: '010059'
          }
        },
        name: {
          value: 'Araba'
        },
        department: {
          value: 'Franchise4'
        },
        capacity: {
          type: 'PropertyValue',
          value: 80
        },
        aggregateRating: {
          type: 'AggregateRating',
          value: {
            ratingValue: 2,
            reviewCount: 38
          }
        },
        priceRange: {
          value: 42
        },
        telephone: {
          value: '945 222 669'
        },
        description: {
          value: 'test'
        },
        url: {
          value: 'http://www.restaurantearaba.com/'
        }
      }, {
        json: true
      })
      .addHeader('X-Auth-Token', token)
      .addHeader('fiware-service', 'tourguide')
      .waits(delay)
      .expectStatus(201)
      .after(function(err, res, body) {
        // jshint camelcase: true
        // jscs:enable
        frisby.create('Post JSON to /api/orion/reservation')
          .post('http://tourguide/api/orion/reservation', {
            '@type': RESERVATION_TYPE,
            partySize: 5,
            reservationFor: {
              '@type': FOOD_ESTABLISHMENT_TYPE,
              name: 'Araba'
            },
            startTime: reservationDate
          }, {
            json: true
          })
          .addHeader('X-Auth-Token', token)
          .addHeader('fiware-service', 'tourguide')
          .waits(delay)
          .expectStatus(201)
          .after(function(err, res, body) {
            var location = res.headers.location;
            frisby.create('Get a Reservation')
              .get('http://tourguide' + location)
              .addHeader('X-Auth-Token', token)
              .addHeader('fiware-service', 'tourguide')
              .waits(delay)
              .expectStatus(200)
              .expectHeaderContains('content-type', 'application/json')
              .expectJSON('*', {
                '@context': 'http://schema.org',
                '@type': RESERVATION_TYPE,
                reservationFor: {
                  '@type': FOOD_ESTABLISHMENT_TYPE,
                  name: 'Araba',
                  address: {
                    '@type': POSTAL_ADDRESS_TYPE
                  }
                },
                underName: {
                  '@type': PERSON_TYPE
                }
              })
              .toss();
            frisby.create('Get a Reservation between dates')
              .get(
                'http://tourguide/api/orion/reservations/' +
                'restaurant/Araba/from/' + (reservationDate) +
                '/to/' +  (reservationDate))
              .addHeader('X-Auth-Token', token)
              .addHeader('fiware-service', 'tourguide')
              .waits(delay)
              .expectStatus(200)
              .expectHeaderContains('content-type', 'application/json')
              .expectJSON('*', {
                '@context': 'http://schema.org',
                '@type': RESERVATION_TYPE,
                reservationFor: {
                  '@type': FOOD_ESTABLISHMENT_TYPE,
                  name: 'Araba',
                  address: {
                    '@type': POSTAL_ADDRESS_TYPE
                  }
                },
                underName: {
                  '@type': PERSON_TYPE
                }
              })
              .toss();
            frisby.create('Patch a Reservation')
              .patch('http://tourguide' + location, {
                'partySize': 10
              }, {
                json: true
              })
              .addHeader('X-Auth-Token', token)
              .addHeader('fiware-service', 'tourguide')
              .waits(delay)
              .expectStatus(204)
              .toss();
            frisby.create('Delete a Reservation')
              .delete('http://tourguide' + location)
              .addHeader('X-Auth-Token', token)
              .addHeader('fiware-service', 'tourguide')
              .waits(delay)
              .expectStatus(204)
              .toss();
          })
          .toss();
        frisby.create('Get a Reservation that does not exist')
          .get('http://tourguide/api/orion/reservation/fail')
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
        frisby.create('Patch a Reservation that does not exist')
          .patch('http://tourguide/api/orion/reservation/fail', {
            'partySize': 'fail!'
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
            // jshint maxlen: 100
            // jscs:disable maximumLineLength
            description: 'The requested entity has not been found. Check type and id'
            // jshint maxlen: 80
            // jscs:enable
          })
          .toss();
        frisby.create('Delete a Reservation that does not exist')
          .delete('http://tourguide/api/orion/reservation/fail')
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
        frisby.create('List all the reservations')
          .get('http://tourguide/api/orion/reservations')
          .addHeader('X-Auth-Token', token)
          .addHeader('fiware-service', 'tourguide')
          .waits(delay)
          .expectStatus(200)
          .expectHeaderContains('content-type', 'application/json')
          .expectJSON('*', {
            '@context': 'http://schema.org',
            '@type': RESERVATION_TYPE,
            reservationFor: {
              '@type': FOOD_ESTABLISHMENT_TYPE
            },
            underName: {
              '@type': PERSON_TYPE
            }
          })
          .toss();
        frisby.create('List all the Reservations of a user')
          .get(
            'http://tourguide/api/orion/reservations/user/user1')
          .addHeader('X-Auth-Token', token)
          .addHeader('fiware-service', 'tourguide')
          .waits(delay)
          .expectStatus(200)
          .expectHeaderContains('content-type', 'application/json')
          .expectJSON('*', {
            'underName': {
              '@type': PERSON_TYPE,
              'name': 'user1'
            }
          })
          .toss();
        frisby.create('List all the Reservations of a restaurant')
          .get(
            'http://tourguide/api/orion/reservations/restaurant/Araba')
          .addHeader('X-Auth-Token', token)
          .addHeader('fiware-service', 'tourguide')
          .waits(delay)
          .expectStatus(200)
          .expectHeaderContains('content-type', 'application/json')
          .expectJSON('*', {
            reservationFor: {
              '@type': FOOD_ESTABLISHMENT_TYPE,
              name: 'Araba'
            }
          })
          .toss();
        frisby.create('List all the Reservations of a restaurant by date')
          // jshint maxlen: 140
          // jscs:disable maximumLineLength
          .get(
            'http://tourguide/api/orion/reservations/restaurant/Araba/from/2014-01-01T00:00:00.000Z/to/2017-01-01T00:00:00.000Z'
          )
          // jshint camelcase: true
          // jscs:enable
          .addHeader('X-Auth-Token', token)
          .addHeader('fiware-service', 'tourguide')
          .waits(delay)
          .expectStatus(200)
          .expectHeaderContains('content-type', 'application/json')
          .expectJSON('*', {
            reservationFor: {
              '@type': FOOD_ESTABLISHMENT_TYPE,
              name: 'Araba'
            }
          })
          .toss();
        frisby.create('List all the Reservations of an Organization')
          .get(
            'http://tourguide/api/orion/reservations/organization/Franchise1'
          )
          .addHeader('X-Auth-Token', token)
          .addHeader('fiware-service', 'tourguide')
          .waits(delay)
          .expectStatus(200)
          .expectHeaderContains('content-type', 'application/json')
          .expectJSON('*', {
            '@context': 'http://schema.org',
            '@type': RESERVATION_TYPE,
            reservationFor: {
              '@type': FOOD_ESTABLISHMENT_TYPE
            },
            underName: {
              '@type': PERSON_TYPE
            }
          })
          .toss();
      });
  })
  .toss();
