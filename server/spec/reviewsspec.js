/*
 * reviewsspec.js
 * Copyright(c) 2015 Bitergia
 * Author: Alberto Martín <alberto.martin@bitergia.com>
 * MIT Licensed
 */
// jshint node: true
// jshint jasmine: true
'use strict';
var frisby = require('frisby');
var utils = require('../utils');
var delay = 200; //miliseconds
var config = require('../config');
var RESTAURANT_TYPE = 'Restaurant';
var REVIEW_TYPE = 'Review';
var PERSON_TYPE = 'Person';
var RATING_TYPE = 'Rating';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var oauthTokenUrl = config.idmUrl + '/oauth2/token';
var username = 'user2@test.com';
var password = 'test';
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
          value: 'Test'
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
        frisby.create('Post JSON to /api/orion/review')
          .post('http://tourguide/api/orion/review', {
            '@type': REVIEW_TYPE,
            'itemReviewed': {
              '@type': RESTAURANT_TYPE,
              'name': 'Araba'
            },
            'name': 'Rating description',
            'reviewBody': 'Body review',
            'reviewRating': {
              '@type': RATING_TYPE,
              'ratingValue': 5
            }
          }, {
            json: true
          })
          .addHeader('X-Auth-Token', token)
          .addHeader('fiware-service', 'tourguide')
          .waits(delay)
          .expectStatus(201)
          .after(function(err, res, body) {
            var location = res.headers.location;
            frisby.create('Get a Review')
              .get('http://tourguide' + location)
              .addHeader('X-Auth-Token', token)
              .addHeader('fiware-service', 'tourguide')
              .waits(delay)
              .expectStatus(200)
              .expectHeaderContains('content-type', 'application/json')
              .expectJSON('*', {
                '@context': 'http://schema.org',
                '@type': REVIEW_TYPE,
                author: {
                  '@type': PERSON_TYPE
                },
                itemReviewed: {
                  '@type': RESTAURANT_TYPE
                },
                reviewRating: {
                  '@type': RATING_TYPE
                }
              })
              .toss();
            frisby.create('Patch a Review')
              .patch('http://tourguide' + location, {
                'reviewBody': 'Patch done!'
              }, {
                json: true
              })
              .addHeader('X-Auth-Token', token)
              .addHeader('fiware-service', 'tourguide')
              .waits(delay)
              .expectStatus(204)
              .toss();
            frisby.create('Delete a Review')
              .delete('http://tourguide' + location)
              .addHeader('X-Auth-Token', token)
              .addHeader('fiware-service', 'tourguide')
              .waits(delay)
              .expectStatus(204)
              .toss();
            frisby.create(
                'Check that the reviews counter are well added to a restaurant'
              )
              .get('http://tourguide/api/orion/restaurant/Araba')
              .addHeader('X-Auth-Token', token)
              .addHeader('fiware-service', 'tourguide')
              .waits(delay)
              .expectStatus(200)
              .expectHeaderContains('content-type', 'application/json')
              .waits(1000)
              .after(function(err, res, body) {
                var element = JSON.parse(res.body);
                var counter = element[0].aggregateRating.reviewCount;
                var rating = element[0].aggregateRating.ratingValue;
                frisby.create('Get all Reviews of a Restaurant')
                  .get(
                    'http://tourguide/api/orion/reviews/restaurant/Araba'
                  )
                  .addHeader('X-Auth-Token', token)
                  .addHeader('fiware-service', 'tourguide')
                  .waits(delay)
                  .expectStatus(200)
                  .expectHeaderContains('content-type',
                    'application/json')
                  .after(function(err, res, body) {
                    var ratingValues = [];
                    var listOfElements = JSON.parse(res.body);
                    for (var x = 0; x < listOfElements.length; x++) {
                      ratingValues.push(listOfElements[x].reviewRating
                        .ratingValue);
                    }
                    expect(listOfElements.length).toEqual(counter);
                    expect(rating).toEqual(utils.getAverage(
                      ratingValues));
                  })
                  .toss();
              })
              .toss();
          })
          .toss();
        frisby.create('List all the reviews')
          .get('http://tourguide/api/orion/reviews')
          .addHeader('X-Auth-Token', token)
          .addHeader('fiware-service', 'tourguide')
          .waits(delay)
          .expectStatus(200)
          .expectHeaderContains('content-type', 'application/json')
          .expectJSON('*', {
            '@context': 'http://schema.org',
            '@type': REVIEW_TYPE,
            author: {
              '@type': PERSON_TYPE
            },
            itemReviewed: {
              '@type': RESTAURANT_TYPE
            }
          })
          .toss();
        frisby.create('Get a Review that does not exist')
          .get('http://tourguide/api/orion/review/fail')
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
        frisby.create('Patch a Review that does not exist')
          .patch('http://tourguide/api/orion/review/fail', {
            'name': 'Patch fail!'
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
        frisby.create('Delete a Review that does not exist')
          .delete('http://tourguide/api/orion/review/fail')
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
        frisby.create('List all the reviews of a user')
          .get(
            'http://tourguide/api/orion/reviews/user/user1')
          .addHeader('X-Auth-Token', token)
          .addHeader('fiware-service', 'tourguide')
          .waits(delay)
          .expectStatus(200)
          .expectHeaderContains('content-type', 'application/json')
          .expectJSON('*', {
            author: {
              '@type': PERSON_TYPE,
              'name': 'user1'
            }
          })
          .toss();
        frisby.create('List all the reviews of a restaurant')
          .get(
            'http://tourguide/api/orion/reviews/restaurant/Araba')
          .addHeader('X-Auth-Token', token)
          .addHeader('fiware-service', 'tourguide')
          .waits(delay)
          .expectStatus(200)
          .expectHeaderContains('content-type', 'application/json')
          .expectJSON('*', {
            itemReviewed: {
              '@type': RESTAURANT_TYPE,
              name: 'Araba'
            }
          })
          .toss();
        frisby.create('List all the reviews of an organization')
          .get(
            'http://tourguide/api/orion/reviews/organization/Franchise1')
          .addHeader('X-Auth-Token', token)
          .addHeader('fiware-service', 'tourguide')
          .waits(delay)
          .expectStatus(200)
          .expectHeaderContains('content-type', 'application/json')
          .expectJSON('*', {
            '@context': 'http://schema.org',
            '@type': REVIEW_TYPE,
            author: {
              '@type': PERSON_TYPE
            },
            itemReviewed: {
              '@type': RESTAURANT_TYPE
            }
          })
          .toss();
      });
  })
  .toss();
