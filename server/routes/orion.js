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
      authRequest('v2/entities', 'POST', elementToOrion, function (err, data){
        if (err) {
          res.statusCode = err.message;
          res.end();
        } else {
          res.statusCode = data;
          res.end();
        }
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
  }, function (err, data) {
    if (err) {
      res.statusCode = err.message;
      res.end();
    } else {
      res.send(utils.dataToSchema(data));
    }
  });
};
exports.updateRestaurant = function (req, res) {
  authRequest('v2/entities/' + encodeURIComponent(encodeURIComponent(req.params
      .id)), 'PATCH', req.body,
    function (err, data){
        if (err) {
          res.statusCode = err.message;
          res.end();
        } else {
          res.statusCode = data;
          res.end();
        }
      });
};
exports.deleteRestaurant = function (req, res) {
  authRequest('v2/entities/' + encodeURIComponent(encodeURIComponent(req.params
      .id)), 'DELETE', {},
    function (err, data){
        if (err) {
          res.statusCode = err.message;
          res.end();
        } else {
          res.statusCode = data;
          res.end();
        }
      });
};

// -- TODO: handle pagination over the whole set of restaurants

exports.getRestaurants = function (req, res) {
  authRequest('v2/entities', 'GET', {
    'type': 'Restaurant',
    'limit': '1000'
  }, function (err, data) {
    if (err) {
      res.statusCode = err.message;
      res.end();
    } else {
      res.send(utils.dataToSchema(data));
    }
  });
};

// Reviews

exports.createReview = function (req, res) {
  var elementToOrion = req.body;
  elementToOrion = utils.reviewToOrion(elementToOrion);
  authRequest('v2/entities', 'POST', elementToOrion,
    function (err, data){
        if (err) {
          res.statusCode = err.message;
          res.end();
        } else {
          res.statusCode = data;
          res.end();
        }
      });
};
exports.readReview = function (req, res) {
  authRequest('v2/entities/' + encodeURIComponent(encodeURIComponent(req.params
    .id)), 'GET', {
    'type': 'Review'
  }, function (err, data) {
    if (err) {
      res.statusCode = err.message;
      res.end();
    } else {
      res.send(utils.dataToSchema(data));
    }
  });
};
exports.updateReview = function (req, res) {
  authRequest('v2/entities/' + encodeURIComponent(encodeURIComponent(req.params
      .id)), 'PATCH', req.body,
    function (err, data){
        if (err) {
          res.statusCode = err.message;
          res.end();
        } else {
          res.statusCode = data;
          res.end();
        }
      });
};
exports.deleteReview = function (req, res) {
  authRequest('v2/entities/' + encodeURIComponent(encodeURIComponent(req.params
      .id)), 'DELETE', {},
    function (err, data){
        if (err) {
          res.statusCode = err.message;
          res.end();
        } else {
          res.statusCode = data;
          res.end();
        }
      });
};
exports.getReviews = function (req, res) {
  authRequest('v2/entities', 'GET', {
    'type': 'Review',
    'limit': '1000'
  }, function (err, data) {
    if (err) {
      res.statusCode = err.message;
      res.end();
    } else {
      res.send(utils.dataToSchema(data));
    }
  });
};

// Reservations

exports.createReservation = function (req, res) {
  var elementToOrion;
  // -- We first get information regarding the restaurant
  authRequest('v2/entities/' +
    encodeURIComponent(encodeURIComponent(req.body.reservationFor.name)),
    'GET', {'type': 'Restaurant'},
    function(err, restaurantObject) {
      if (err) {
        res.statusCode = err.message;
        res.end();
    } else {
        elementToOrion = req.body;
        elementToOrion = utils.reservationToOrion(elementToOrion);
        elementToOrion.reservationFor.address = restaurantObject.address;
        authRequest('v2/entities', 'POST', elementToOrion,
        function (err, data){
          if (err) {
            res.statusCode = err.message;
            res.end();
          } else {
            res.statusCode = data;
            res.end();
          }
      });
    }
  });
};
exports.readReservation = function (req, res) {
  authRequest('v2/entities/' + encodeURIComponent(encodeURIComponent(req.params
    .id)), 'GET', {
    'type': 'FoodEstablishmentReservation'
  }, function (err, data) {
    if (err) {
      res.statusCode = err.message;
      res.end();
    } else {
      res.send(utils.dataToSchema(data));
    }
  });
};

exports.updateReservation = function (req, res) {
  authRequest('v2/entities/' + encodeURIComponent(encodeURIComponent(req.params
      .id)), 'PATCH', req.body,
    function (err, data){
        if (err) {
          res.statusCode = err.message;
          res.end();
        } else {
          res.statusCode = data;
          res.end();
        }
      });
};
exports.deleteReservation = function (req, res) {
  authRequest('v2/entities/' + encodeURIComponent(encodeURIComponent(req.params
      .id)), 'DELETE', {},
    function (err, data){
        if (err) {
          res.statusCode = err.message;
          res.end();
        } else {
          res.statusCode = data;
          res.end();
        }
      });
};
exports.getReservations = function (req, res) {
  authRequest('v2/entities', 'GET', {
    'type': 'FoodEstablishmentReservation',
    'limit': '1000'
  }, function (err, data) {
    if (err) {
      res.statusCode = err.message;
      res.end();
    } else {
      res.send(utils.dataToSchema(data));
    }
  });
};