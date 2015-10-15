/* jshint node:true */
/*
 * Orion-V2 REST API
 */
'use strict';
var authRequest = require('../authrequest');
var utils = require('../utils');
var geocoder = require('node-geocoder')('google', 'http');

// Restaurants

exports.createRestaurant = function(req, res) {
  var elementToOrion = req.body;
  var address = elementToOrion.address.streetAddress + ' ' +
      elementToOrion.address.addressLocality;
  geocoder.geocode(address)
    .then(function(geoRes) {
      if (geoRes !== '[]') {
        elementToOrion = utils.restaurantToOrion(elementToOrion, geoRes[0]);
      }
      authRequest(
        '/v2/entities',
        'POST',
        elementToOrion)
        .then(function(data) {
          res.statusCode = data.statusCode;
          res.end();
        })
        .catch(function(err) {
          res.statusCode = err.statusCode;
          res.end();
        });
    })
    .catch(function(err) {
      console.log('Geo-location could not be processed. Error: ' + err);
      authRequest(
        '/v2/entities',
        'POST',
        elementToOrion)
        .then(function(data) {
          res.statusCode = data.statusCode;
          res.end();
        })
        .catch(function(err) {
          res.statusCode = err.statusCode;
          res.end();
        });
    });
};

exports.readRestaurant = function(req, res) {
  authRequest(
    '/v2/entities/' + encodeURIComponent(req.params.id),
    'GET',
    {'type': 'Restaurant'})
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.json(utils.dataToSchema(data.body));
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};

exports.updateRestaurant = function(req, res) {
  authRequest(
    '/v2/entities/' + encodeURIComponent(req.params.id),
    'PATCH',
    req.body)
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.end();
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};

exports.deleteRestaurant = function(req, res) {
  authRequest(
    '/v2/entities/' + encodeURIComponent(req.params.id),
    'DELETE',
    {})
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.end();
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};

// -- TODO: handle pagination over the whole set of restaurants

exports.getRestaurants = function(req, res) {
  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'Restaurant','limit': '1000'})
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.json(utils.dataToSchema(data.body));
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};

exports.getUserRestaurants = function(req, res) {
  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'Restaurant','limit': '1000'})
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.json(utils.dataToSchema(data.body));
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });

};

exports.getOrganizationRestaurants = function(req, res) {
  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'Restaurant','limit': '1000'})
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.json(utils.dataToSchema(data.body));
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};

// Reviews

exports.createReview = function(req, res) {
  var elementToOrion = req.body;
  elementToOrion = utils.reviewToOrion(elementToOrion);
  authRequest(
    '/v2/entities',
    'POST',
    elementToOrion)
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.end();
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};

exports.readReview = function(req, res) {
  authRequest(
    '/v2/entities/' + encodeURIComponent(req.params.id),
    'GET',
    {'type': 'Review'})
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.json(utils.dataToSchema(data.body));
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};

exports.updateReview = function(req, res) {
  authRequest(
    '/v2/entities/' + encodeURIComponent(req.params.id),
    'PATCH',
    req.body)
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.end();
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};

exports.deleteReview = function(req, res) {
  authRequest(
    '/v2/entities/' + encodeURIComponent(req.params.id),
    'DELETE',
    {})
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.end();
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};

exports.getReviews = function(req, res) {
  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'Review','limit': '1000'})
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.json(utils.dataToSchema(data.body));
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};

exports.getUserReviews = function(req, res) {
  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'Review','limit': '1000'})
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.json(utils.dataToSchema(data.body));
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });

};

exports.getOrganizationReviews = function(req, res) {
  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'Review','limit': '1000'})
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.json(utils.dataToSchema(data.body));
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};

// Reservations

exports.createReservation = function(req, res) {
  var elementToOrion;
  // -- We first get information regarding the restaurant
  authRequest(
    '/v2/entities/' + encodeURIComponent(req.body.reservationFor.name),
    'GET',
    {'type': 'Restaurant'})
    .then(function(data) {
      elementToOrion = req.body;
      elementToOrion = utils.reservationToOrion(elementToOrion);
      elementToOrion.reservationFor.address = data.address;
      authRequest(
        '/v2/entities',
        'POST',
        elementToOrion)
        .then(function(data) {
          res.statusCode = data.statusCode;
          res.end();
        })
        .catch(function(err) {
          res.statusCode = err.statusCode;
          res.end();
        });
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};

exports.readReservation = function(req, res) {
  authRequest(
    '/v2/entities/' + encodeURIComponent(req.params.id),
    'GET',
    {'type': 'FoodEstablishmentReservation'})
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.json(utils.dataToSchema(data.body));
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};

exports.updateReservation = function(req, res) {
  authRequest(
    '/v2/entities/' + encodeURIComponent(req.params.id),
    'PATCH',
    req.body)
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.end();
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};
exports.deleteReservation = function(req, res) {
  authRequest(
    '/v2/entities/' + encodeURIComponent(req.params.id),
    'DELETE',
    {})
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.end();
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};
exports.getReservations = function(req, res) {
  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'FoodEstablishmentReservation','limit': '1000'})
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.json(utils.dataToSchema(data.body));
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};

exports.getUserReservations = function(req, res) {
  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'FoodEstablishmentReservation','limit': '1000'})
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.json(utils.dataToSchema(data.body));
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};

exports.getOrganizationsReservations = function(req, res) {
  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'FoodEstablishmentReservation','limit': '1000'})
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.json(utils.dataToSchema(data.body));
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};
};
