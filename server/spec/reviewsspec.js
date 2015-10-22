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

frisby.create('Post JSON to /api/orion/review')
  .post('http://compose_devguide_1/api/orion/review', {
    '@type': 'Review',
    'itemReviewed': {
      '@type': 'Restaurant',
      'name': 'Araba'
    },
    'name': 'Rating description',
    'reviewBody': 'Body review',
    'reviewRating': {
      '@type': 'Rating',
      'ratingValue': 5
    }
  }, {
    json: true
  })
  .expectStatus(201)
  .after(function(err, res, body) {
    var location = res.headers.location;

    frisby.create('Get a Review')
      .get('http://compose_devguide_1' + location)
      .expectStatus(200)
      .expectHeaderContains('content-type', 'application/json')
      .expectJSON('*', {
        '@context': 'http://schema.org',
        '@type': 'Review',
        author: {
          '@type': 'Person'
        },
        itemReviewed: {
          '@type': 'Restaurant'
        },
        reviewRating: {
          '@type': 'Rating'
        }
      })
      .toss();

    frisby.create('Patch a Review')
      .patch('http://compose_devguide_1' + location, {
        'name': 'Patch done!'
      }, {
        json: true
      })
      .expectStatus(204)
      .toss();

    frisby.create('Delete a Review')
      .delete('http://compose_devguide_1' + location)
      .expectStatus(204)
      .toss();
  })
  .toss();

frisby.create('List all the reviews')
  .get('http://compose_devguide_1/api/orion/reviews')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('*', {
    '@context': 'http://schema.org',
    '@type': 'Review',
    author: {
      '@type': 'Person'
    },
    itemReviewed: {
      '@type': 'Restaurant'
    },
    reviewRating: {
      '@type': 'Rating'
    }
  })
  .toss();

frisby.create('Get a Review that does not exist')
  .get('http://compose_devguide_1/api/orion/review/fail')
  .expectStatus(404)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON({
    error: 'NotFound',
    description: 'The requested entity has not been found. Check type and id'
  })
  .toss();

frisby.create('Patch a Review that does not exist')
  .patch('http://compose_devguide_1/api/orion/review/fail', {
    'name': 'Patch fail!'
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

frisby.create('Delete a Review that does not exist')
  .delete('http://compose_devguide_1/api/orion/review/fail')
  .expectStatus(404)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON({
    error: 'NotFound',
    description: 'The requested entity has not been found. Check type and id'
  })
  .toss();

frisby.create('List all the reviews of a user')
  .get(
    'http://compose_devguide_1/api/orion/reviews/user/user1')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('*', {
    author: {
      '@type': 'Person',
      'name': 'user1'
    }
  })
  .toss();

frisby.create('List all the reviews of a restaurant')
  .get(
    'http://compose_devguide_1/api/orion/reviews/restaurant/Araba')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('*', {
    itemReviewed: {
      '@type': 'Restaurant',
      name: 'Araba'
    }
  })
  .toss();
