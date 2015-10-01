/*jshint node:true */
/*
 * Orion-V2 REST API
 */
'use strict';
var authRequest = require('../authrequest');
var utils = require('../utils');
var geocoder = require('node-geocoder')('google', 'http');

// Restaurants

exports.createRestaurant = function (req, res) {
  var elementToOrion = req.body;
  var address = elementToOrion.address.streetAddress + ' '+
  elementToOrion.address.addressLocality;
  geocoder.geocode(address)
    .then(function(geoRes) {
      elementToOrion = utils.restaurantToOrion(elementToOrion, geoRes[0]);
      authRequest('v2/entities', 'POST', elementToOrion, function (data){
        console.log(data);
        res.end();
      });
    })
    .catch(function(err) {
        console.log(err);
    });
};

exports.readRestaurant = function (req, res) {
  authRequest('v2/entities/' + encodeURIComponent(encodeURIComponent(req.params
    .id)), 'GET', {
    'type': 'Restaurant'
  }, function (data) {
    res.send(utils.dataToSchema(data));
  });
};
exports.updateRestaurant = function (req, res) {
  authRequest('v2/entities/' + encodeURIComponent(encodeURIComponent(req.params
      .id)), 'PATCH', req.body,
    function (data) {
      console.log(data);
      res.end();
    });
};
exports.deleteRestaurant = function (req, res) {
  authRequest('v2/entities/' + encodeURIComponent(encodeURIComponent(req.params
      .id)), 'DELETE', {},
    function (data) {
      console.log(data);
      res.end();
    });
};

// -- TODO: handle pagination over the whole set of restaurants

exports.getRestaurants = function (req, res) {
  authRequest('v2/entities', 'GET', {
    'type': 'Restaurant',
    'limit': '1000'
  }, function (data) {
    res.send(utils.dataToSchema(data));
  });
};

// Reviews

exports.createReview = function (req, res) {
  var elementToOrion = req.body;
  elementToOrion = utils.reviewToOrion(elementToOrion);
  authRequest('v2/entities', 'POST', elementToOrion,
    function (data) {
      console.log(data);
      res.end();
    });
};
exports.readReview = function (req, res) {
  authRequest('v2/entities/' + encodeURIComponent(encodeURIComponent(req.params
    .id)), 'GET', {
    'type': 'Review'
  }, function (data) {
    res.send(utils.dataToSchema(data));
  });
};
exports.updateReview = function (req, res) {
  authRequest('v2/entities/' + encodeURIComponent(encodeURIComponent(req.params
      .id)), 'PATCH', req.body,
    function (data) {
      console.log(data);
      res.end();
    });
};
exports.deleteReview = function (req, res) {
  authRequest('v2/entities/' + encodeURIComponent(encodeURIComponent(req.params
      .id)), 'DELETE', {},
    function (data) {
      console.log(data);
      res.end();
    });
};
exports.getReviews = function (req, res) {
  authRequest('v2/entities', 'GET', {
    'type': 'Review',
    'limit': '1000'
  }, function (data) {
    res.send(utils.dataToSchema(data));
  });
};

// Reservations

exports.createReservation = function (req, res) {
  authRequest('v2/entities', 'POST', req.body,
    function (data) {
      console.log(data);
      res.end();
    });
};
exports.readReservation = function (req, res) {
  authRequest('v2/entities/' + encodeURIComponent(encodeURIComponent(req.params
    .id)), 'GET', {
    'type': 'FoodEstablishmentReservation'
  }, function (data) {
    res.send(utils.dataToSchema(data));
  });
};
// update_reservation function replaces ALL of the elements
exports.updateReservation = function (req, res) {
  authRequest('v2/entities/' + encodeURIComponent(encodeURIComponent(req.params
      .id)), 'PATCH', req.body,
    function (data) {
      console.log(data);
      res.end();
    });
};
exports.deleteReservation = function (req, res) {
  authRequest('v2/entities/' + encodeURIComponent(encodeURIComponent(req.params
      .id)), 'DELETE', {},
    function (data) {
      console.log(data);
      res.end();
    });
};
exports.getReservations = function (req, res) {
  authRequest('v2/entities', 'GET', {
    'type': 'FoodEstablishmentReservation',
    'limit': '1000'
  }, function (data) {
    res.send(utils.dataToSchema(data));
  });
};

// User data
// To be fixed
exports.getUserReviews = function (req, res) {
  authRequest('v2/entities', 'GET', {
      'type': 'Review',
      'author': {
        'type': 'Person',
        'value': [{
          'name': 'name',
          'value': req.params.id
        }]
      }
    },
    function (data) {
      res.send(utils.dataToSchema(data));
    });
};
//To be fixed
exports.getUserReservations = function (req, res) {
  authRequest('v2/entities', 'GET', {
      'type': 'FoodEstablishmentReservation',
      'underName': {
        'type': 'Person',
        'value': [{
          'name': 'name',
          'value': req.params.id
        }]
      }
    },
    function (data) {
      res.send(utils.dataToSchema(data));
    });
};