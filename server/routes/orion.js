/* jshint node:true */
/*
 * Orion-V2 REST API
 */
'use strict';
var authRequest = require('../authrequest');
var utils = require('../utils');
var geocoder = require('node-geocoder')('google', 'http');
var async = require('async');

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
          res.headers = data.headers;
          res.location('/api/orion/restaurant/' + elementToOrion.id);
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

exports.getOrganizationRestaurants = function (req, res) {
  var organizationRestaurants = [];
  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'Restaurant','limit': '1000'})
  .then(function (data){
    organizationRestaurants = utils.getOrgRestaurants(
      req.params.org,
      data.body);
    res.statusCode = data.statusCode;
    res.json(utils.dataToSchema(organizationRestaurants));
  })
  .catch(function (err){
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
      res.headers = data.headers;
      res.location('/api/orion/review/' + elementToOrion.id);
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

exports.getUserReviews = function (req, res) {
  var userReviews = [];
  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'Review','limit': '1000'})
  .then(function (data){
    userReviews = utils.getUserReviews(req.params.user, data.body);
    res.statusCode = data.statusCode;
    res.json(utils.dataToSchema(userReviews));
  })
  .catch(function (err){
    res.statusCode = err.statusCode;
    res.end();
  });
};

exports.getRestaurantReviews = function (req, res) {
  var restaurantReviews = [];
  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'Review','limit': '1000'})
  .then(function (data){
    restaurantReviews = utils.getRestaurantReviews(
      req.params.restaurant,
      data.body);
    res.statusCode = data.statusCode;
    res.json(utils.dataToSchema(restaurantReviews));
  })
  .catch(function (err){
    res.statusCode = err.statusCode;
    res.end();
  });
};

exports.getOrganizationReviews = function (req, res) {
  var organizationReviews = [];
  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'Review','limit': '1000'})
  .then(function (reviews){
    authRequest(
      '/v2/entities',
      'GET',
      {'type': 'Restaurant','limit': '1000'})
    .then(function (restaurants){
      organizationReviews = utils.getOrgReviews(
        req.params.org,
        restaurants.body,
        reviews.body);
      res.statusCode = restaurants.statusCode;
      res.json(utils.dataToSchema(organizationReviews));
    })
    .catch(function (err){
      res.statusCode = err.statusCode;
      res.end();
    });
  })
  .catch(function (err){
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
          res.headers = data.headers;
          res.location('/api/orion/reservation/' + elementToOrion.id);
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

exports.getUserReservations = function (req, res) {
  var userReservations = [];
  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'FoodEstablishmentReservation','limit': '1000'})
  .then(function (data){
    userReservations = utils.getUserReservations(
      req.params.user,
      data.body);
    res.statusCode = data.statusCode;
    res.json(utils.dataToSchema(userReservations));
  })
  .catch(function (err){
    res.statusCode = err.statusCode;
    res.end();
  });
};

exports.getRestaurantReservations = function (req, res) {
  var restaurantReservations = [];
  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'FoodEstablishmentReservation','limit': '1000'})
  .then(function (data){
    restaurantReservations = utils.getRestaurantReservations(
      req.params.restaurant,
      data.body);
    res.statusCode = data.statusCode;
    res.json(utils.dataToSchema(restaurantReservations));
  })
  .catch(function (err){
    res.statusCode = err.statusCode;
    res.end();
  });
};

exports.getOrganizationReservations = function(req, res) {
  var organizationsReservations = [];
  authRequest(
    '/v2/entities',
    'GET',
    {'type': 'FoodEstablishmentReservation','limit': '1000'})
  .then(function (reservations){
    authRequest(
      '/v2/entities',
      'GET',
      {'type': 'Restaurant','limit': '1000'})
    .then(function (restaurants){
      organizationsReservations = utils.getOrgReservations(
        req.params.org,
        restaurants.body,
        reservations.body);
      res.statusCode = restaurants.statusCode;
      res.json(utils.dataToSchema(organizationsReservations));
    })
    .catch(function (err){
      res.statusCode = err.statusCode;
      res.end();
    });
  })
  .catch(function (err){
    res.statusCode = err.statusCode;
    res.end();
  });
};

// Sensors
exports.updateSensors = function(req, res) {
  var data = req.body;
  console.log('Sensor notification received:',
              data.contextResponses.length, 'notifications');

  function processNotification(elem, callback) {

    var item = elem.contextElement;
    var restaurant = {};

    restaurant.Pattern = /^SENSOR_(?:TEMP|HUM)_(.*)_(Kitchen|Dining)$/;

    if (item.id.search(restaurant.Pattern) == -1) {
      // not a restaurant sensor
      console.log('Ignored notification:', item.id);
      res.end();
      return callback(null);
    }

    restaurant.Name = restaurant.Pattern.exec(item.id)[1];
    restaurant.Room = restaurant.Pattern.exec(item.id)[2];

    console.log('Restaurant:', restaurant.Name);

    // get the restaurant info
    authRequest(
      '/v2/entities/' + restaurant.Name,
      'GET',
      {'type': 'Restaurant'})
      .then(
        function(data) {
          // restaurant exists
          var newProperty = restaurant.Room + '_' + item.attributes[0].name;
          var schema = {};
          schema[newProperty] = {
            '@type': 'PropertyValue',
            'additionalType': item.attributes[0].name,
            'propertyID': item.id,
            'name': restaurant.Room,
            'value': item.attributes[0].value
          };
          console.log('Schema:', schema);
          // update restaurant
          return authRequest(
            '/v2/entities/' + restaurant.Name,
            'POST',
            schema)
            .then(
              function(data) {
                // restaurant updated
                callback(null);
              })
            .catch(
              function(err) {
                // error updating restaurant
                console.log('ERROR:', err.message);
                callback(err);
              }
            );
        })
      .catch(
        function(err) {
          console.log(err);
          callback(err);
        }
      );
  }

  function processEnd(err) {
    if (err) {
      console.log(err);
      res.statusCode = 500;
      res.end();
    } else {
      console.log('done');
      res.statusCode = 200;
      res.end();
    }
  }

  async.eachSeries(
    data.contextResponses,
    processNotification,
    processEnd
  );
};
