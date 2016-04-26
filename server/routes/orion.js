/*
 * orion.js
 * Copyright(c) 2016 Bitergia
 * Author: Bitergia <fiware-testing@bitergia.com>
 * MIT Licensed
 *
 * Orion-V2 REST API
 *
 */

// jshint node: true

'use strict';

var authRequest = require('../auth/authrequest');
var utils = require('../utils');
var geocoder = require('node-geocoder')('google', 'http');
var async = require('async');
var auth = require('../auth/auth');
var tv4 = require('tv4');
var schema = require('../schema/schema');

var config = require('../config');
var fiwareHeaders = {
  'fiware-service': config.fiwareService
};

var rstrnt = 'Restaurant';
var rev = 'Review';
var resv = 'FoodEstablishmentReservation';

tv4.addSchema('restaurant', schema.restaurant);
tv4.addSchema('reservation', schema.reservation);
tv4.addSchema('review', schema.review);

// Restaurants

exports.createRestaurant = function(req, res) {
  var elementToOrion = req.body;
  var validSchema = tv4.validate(elementToOrion, 'restaurant');
  if (validSchema) {
    var address = elementToOrion.address.streetAddress + ' ' +
                  elementToOrion.address.addressLocality;
    geocoder.geocode(address)
    .then(function(geoObject) {
      elementToOrion = utils.restaurantToOrion(elementToOrion, geoObject[0]);
      return utils.sendRequest('POST', elementToOrion, null, req.headers);
    })
    .then(function(postResponse) {
      utils.responsePost(postResponse, elementToOrion, res);
    })
    .catch(function(err) {
      utils.responseError(err, res);
    });
  } else {
    utils.returnInvalidSchema(res, tv4);
  }
};

exports.readRestaurant = function(req, res) {
  var occupancyLevelsObject;
  var servicePath;
  var fiwareHeaders;
  var restaurantId = utils.generateId(req.params.id);
  var currentDate = new Date().toISOString();
  var filter = [];
  var queryString = {};
  var timeframe = utils.getTimeframe(currentDate);
  utils.addConditionToQuery(filter, 'startTime', '==', timeframe);
  utils.addConditionToQuery(filter, 'reservationFor', '==', req.params.id);
  utils.addConditionToQuery(filter, 'reservationStatus', '==', 'Confirmed');
  queryString.q = filter.join(';');
  utils.getListByType(resv, null, req.headers, queryString)
  .then(function(reservations) {
    occupancyLevelsObject = utils.updateOccupancyLevels(reservations.body,
                                                        currentDate);
    return utils.getListByType(rstrnt, restaurantId, req.headers);
  })
  .then(function(restaurant) {
    servicePath = restaurant.body.department;
    fiwareHeaders = utils.completeHeaders(req.headers, servicePath);
    return utils.sendRequest('PATCH', occupancyLevelsObject, restaurantId,
                             fiwareHeaders);
  })
  .then(function(patchResponse) {
    return utils.getListByType(rstrnt, restaurantId, req.headers);
  })
  .then(function(restaurant) {
    utils.returnResponse(restaurant, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.readRestaurantWithDate = function(req, res) {
  var occupancyLevelsObject;
  var servicePath;
  var fiwareHeaders;
  var restaurantId = utils.generateId(req.params.id);
  var filter = [];
  var queryString = {};
  var timeframe = utils.getTimeframe(req.params.date);
  utils.addConditionToQuery(filter, 'startTime', '==', timeframe);
  queryString.q = filter.join(';');
  utils.getListByType(resv, null, req.headers, queryString)
  .then(function(reservations) {
    occupancyLevelsObject = utils.updateOccupancyLevels(reservations.body,
                                                        req.params.date);
    return utils.getListByType(rstrnt, restaurantId, req.headers);
  })
  .then(function(restaurant) {
    servicePath = restaurant.body.department;
    fiwareHeaders = utils.completeHeaders(req.headers, servicePath);
    return utils.sendRequest('PATCH', occupancyLevelsObject, restaurantId,
                             fiwareHeaders);
  })
  .then(function(patchResponse) {
    return utils.getListByType(rstrnt, restaurantId, req.headers);
  })
  .then(function(restaurant) {
    utils.returnResponse(restaurant, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.updateRestaurant = function(req, res) {
  var queryString = {'options': 'keyValues'};
  var restaurantId = utils.generateId(req.params.id);
  utils.sendRequest('PATCH', req.body, restaurantId, req.headers, queryString)
  .then(function(patchResponse) {
    utils.returnResponse(patchResponse, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.deleteRestaurant = function(req, res) {
  var restaurantId = utils.generateId(req.params.id);
  utils.sendRequest('DELETE', null, restaurantId, req.headers)
  .then(function(deleteResponse) {
    utils.returnResponse(deleteResponse, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.getRestaurants = function(req, res) {
  utils.getListByType(rstrnt, null, req.headers)
  .then(function(restaurants) {
    utils.returnResponse(restaurants, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.getOrganizationRestaurants = function(req, res) {
  var filter = [];
  var queryString = {};
  utils.addConditionToQuery(filter, 'department', '==', req.params.org);
  queryString.q = filter.join(';');
  utils.getListByType(rstrnt, null, req.headers, queryString)
  .then(function(restaurants) {
    utils.returnResponse(restaurants, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

// Reviews

exports.createReview = function(req, res) {
  var elementToOrion = req.body;
  var restaurantName = elementToOrion.itemReviewed.name;
  var restaurantId = utils.generateId(restaurantName);
  var filter = [];
  var queryString = {};
  var servicePath;
  var fiwareHeaders;
  var aggregateRatings;
  var endResponse;
  var validSchema = tv4.validate(elementToOrion, 'review');
  if (validSchema) {
    utils.getListByType(rstrnt, restaurantId, req.headers)
    .then(function(restaurant) {
      servicePath = restaurant.body.department;
      return auth.getUserDataPromise(req);
    })
    .then(function(userObject) {
      fiwareHeaders = utils.removeServicePath(req.headers);
      elementToOrion = utils.reviewToOrion(userObject, elementToOrion);
      return utils.sendRequest('POST', elementToOrion, null, fiwareHeaders);
    })
    .then(function(postResponse) {
      endResponse = postResponse;
      utils.addConditionToQuery(filter, 'itemReviewed', '==', restaurantName);
      queryString.q = filter.join(';');
      return utils.getListByType(rev, null, req.headers, queryString);
    })
    .then(function(reviews) {
      aggregateRatings = utils.getAggregateRating(reviews.body);
      fiwareHeaders = utils.completeHeaders(req.headers, servicePath);
      return utils.sendRequest('PATCH', aggregateRatings, restaurantId,
                               fiwareHeaders);
    })
    .then(function(patchResponse) {
      utils.responsePost(endResponse, elementToOrion, res);
    })
    .catch(function(err) {
      utils.responseError(err, res);
    });
  } else {
    utils.returnInvalidSchema(res, tv4);
  }
};

exports.readReview = function(req, res) {
  var reviewId = req.params.id;
  utils.getListByType(rev, reviewId, req.headers)
  .then(function(review) {
    utils.returnResponse(review, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.updateReview = function(req, res) {
  var reviewId = req.params.id;
  var restaurantName;
  var restaurantId;
  var userId;
  var aggregateRatings;
  var servicePath;
  var fiwareHeaders;
  var filter = [];
  var queryString = {};
  var keyValues = {'options': 'keyValues'};
  utils.getListByType(rev, reviewId, req.headers)
  .then(function(data) {
    restaurantName = data.body.itemReviewed;
    restaurantId = utils.generateId(restaurantName);
    userId = data.body.author;
    return auth.getUserDataPromise(req);
  })
  .then(function(userObject) {
    if (userId === userObject.id) {
      utils.sendRequest('PATCH', req.body, reviewId, req.headers, keyValues)
      .then(function(patchResponse) {
        fiwareHeaders = utils.removeServicePath(req.headers);
        utils.addConditionToQuery(filter, 'itemReviewed', '==', restaurantName);
        queryString.q = filter.join(';');
        return utils.getListByType(rev, null, fiwareHeaders, queryString);
      })
      .then(function(reviews) {
        aggregateRatings = utils.getAggregateRating(reviews.body);
        return utils.getListByType(rstrnt, restaurantId, req.headers);
      })
      .then(function(restaurant) {
        servicePath = restaurant.body.department;
        fiwareHeaders = utils.completeHeaders(req.headers, servicePath);
        return utils.sendRequest('PATCH', aggregateRatings, restaurantId,
                                 fiwareHeaders);
      })
      .then(function(patchResponse) {
        utils.returnResponse(patchResponse, res);
      })
      .catch(function(err) {
        utils.responseError(err, res);
      });
    } else {
      utils.returnForbidden(res);
    }
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.deleteReview = function(req, res) {
  var restaurantName;
  var restaurantId;
  var aggregateRatings;
  var servicePath;
  var fiwareHeaders;
  var filter = [];
  var queryString = {};
  var finalResponse;
  var reviewId = req.params.id;
  utils.getListByType(rev, reviewId, req.headers)
  .then(function(review) {
    restaurantName = review.body.itemReviewed;
    restaurantId = utils.generateId(restaurantName);
    return utils.getListByType(rstrnt, restaurantId, req.headers);
  })
  .then(function(restaurant) {
    servicePath = restaurant.body.department;
    return utils.sendRequest('DELETE', null, reviewId, req.headers);
  })
  .then(function(deleteResponse) {
    finalResponse = deleteResponse;
    utils.addConditionToQuery(filter, 'itemReviewed', '==', restaurantName);
    queryString.q = filter.join(';');
    return utils.getListByType(rev, null, req.headers, queryString);
  })
  .then(function(reviews) {
    aggregateRatings = utils.getAggregateRating(reviews.body);
    fiwareHeaders = utils.completeHeaders(req.headers, servicePath);
    return utils.sendRequest('PATCH', aggregateRatings, restaurantId,
                             fiwareHeaders);
  })
  .then(function(pathResponse) {
    utils.returnResponse(finalResponse, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.getReviews = function(req, res) {
  utils.getListByType(rev, null, req.headers)
  .then(function(reviews) {
    utils.returnResponse(reviews, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.getUserReviews = function(req, res) {
  var filter = [];
  var queryString = {};
  utils.addConditionToQuery(filter, 'author', '==', req.params.user);
  queryString.q = filter.join(';');
  utils.getListByType(rev, null, req.headers, queryString)
  .then(function(reviews) {
    utils.returnResponse(reviews, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.getRestaurantReviews = function(req, res) {
  var filter = [];
  var queryString = {};
  utils.addConditionToQuery(filter, 'itemReviewed', '==',
                            req.params.restaurant);
  queryString.q = filter.join(';');
  utils.getListByType(rev, null, req.headers, queryString)
  .then(function(reviews) {
    utils.returnResponse(reviews, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.getOrganizationReviews = function(req, res) {
  var filter = [];
  var queryString = {};
  utils.addConditionToQuery(filter, 'publisher', '==', req.params.org);
  queryString.q = filter.join(';');
  utils.getListByType(rev, null, req.headers, queryString)
  .then(function(reviews) {
    utils.returnResponse(reviews, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

// Reservations

exports.createReservation = function(req, res) {
  var elementToOrion = req.body;
  var restaurantReservations;
  var capacity;
  var currentOccupancyLevels;
  var timeframe = utils.getTimeframe(req.body.startTime);
  var filter = [];
  var queryString = {};
  var restaurantId = utils.generateId(req.body.reservationFor.name);
  var validSchema = tv4.validate(req.body, 'reservation');
  if (validSchema) {
    utils.getListByType(rstrnt, restaurantId, req.headers)
    .then(function(restaurant) {
      elementToOrion.address = restaurant.body.address;
      capacity = restaurant.body.capacity;
      utils.addConditionToQuery(filter, 'startTime', '==', timeframe);
      utils.addConditionToQuery(filter, 'reservationFor', '==', req.params.id);
      utils.addConditionToQuery(filter, 'reservationStatus', '==', 'Confirmed');
      queryString.q = filter.join(';');
      return utils.getListByType(resv, null, req.headers, queryString);
    })
    .then(function(reservations) {
      currentOccupancyLevels = utils.getOccupancyLevels(reservations.body);
      if (currentOccupancyLevels + req.body.partySize < capacity) {
        auth.getUserDataPromise(req)
        .then(function(userObject) {
          elementToOrion = utils.reservationToOrion(userObject, elementToOrion);
          return utils.sendRequest('POST', elementToOrion, null, req.headers);
        })
        .then(function(postResponse) {
          utils.responsePost(postResponse, elementToOrion, res);
        })
        .catch(function(err) {
          utils.responseError(err, res);
        });
      } else {
        utils.returnConflict(res);
      }
    })
    .catch(function(err) {
      utils.responseError(err, res);
    });
  } else {
    utils.returnInvalidSchema(res, tv4);
  }
};

exports.readReservation = function(req, res) {
  var reservationId = req.params.id;
  utils.getListByType(resv, reservationId,
    req.headers)
  .then(function(reservation) {
    utils.returnResponse(reservation, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.updateReservation = function(req, res) {
  var restaurantName;
  var userId;
  var reservationId = req.params.id;
  var keyValues = {'options': 'keyValues'};
  utils.getListByType(resv, reservationId, req.headers)
  .then(function(reservation) {
    userId = reservation.body.underName;
    return auth.getUserDataPromise(req);
  })
  .then(function(userObject) {
    if (userId === userObject.id) {
      utils.sendRequest('PATCH', req.body, reservationId, req.headers,
                        keyValues)
      .then(function(patchResponse) {
        utils.returnResponse(patchResponse, res);
      })
      .catch(function(err) {
        utils.responseError(err, res);
      });
    } else {
      utils.returnForbidden(res);
    }
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.deleteReservation = function(req, res) {
  var reservationId = req.params.id;
  utils.sendRequest('DELETE', null, reservationId, req.headers)
  .then(function(deleteResponse) {
    utils.returnResponse(deleteResponse, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.getReservations = function(req, res) {
  utils.getListByType(resv, null, req.headers)
  .then(function(reservations) {
    utils.returnResponse(reservations, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.getUserReservations = function(req, res) {
  var filter = [];
  var queryString = {};
  utils.addConditionToQuery(filter, 'underName', '==', req.params.user);
  queryString.q = filter.join(';');
  utils.getListByType(resv, null, req.headers, queryString)
  .then(function(reservations) {
    utils.returnResponse(reservations, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.getRestaurantReservations = function(req, res) {
  var filter = [];
  var queryString = {};
  utils.addConditionToQuery(filter, 'reservationFor', '==',
                            req.params.restaurant);
  queryString.q = filter.join(';');
  utils.getListByType(resv, null, req.headers, queryString)
  .then(function(reservations) {
    utils.returnResponse(reservations, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.getOrganizationReservations = function(req, res) {
  var filter = [];
  var queryString = {};
  var organizationsReservations;
  var restaurantList;
  utils.addConditionToQuery(filter, 'department', '==', req.params.org);
  queryString.q = filter.join(';');
  utils.getListByType(rstrnt, null, req.headers, queryString)
  .then(function(restaurants) {
    restaurantList = restaurants.body;
    return utils.getListByType(resv, null, req.headers);
  })
  .then(function(reservations) {
    organizationsReservations = utils.getOrgReservations(restaurantList,
                                                         reservations.body);
    res.statusCode = reservations.statusCode;
    res.json(utils.dataToSchema(organizationsReservations));
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

exports.getReservationsByDate = function(req, res) {
  var timeframe = utils.getTimeBetweenDates(req.params.from, req.params.to);
  var filter = [];
  var queryString = {};
  utils.addConditionToQuery(filter, 'startTime', '==', timeframe);
  utils.addConditionToQuery(filter, 'reservationFor', '==',
                            req.params.restaurant);
  queryString.q = filter.join(';');
  utils.getListByType(resv, null, req.headers, queryString)
  .then(function(reservations) {
    utils.returnResponse(reservations, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
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
      return callback(null);
    }

    restaurant.Name = restaurant.Pattern.exec(item.id)[1];
    restaurant.Room = restaurant.Pattern.exec(item.id)[2];

    console.log('Restaurant:', restaurant.Name);

    // get the restaurant info
    authRequest(
      '/v2/entities/' + restaurant.Name,
      'GET',
      {'type': 'Restaurant'},
      fiwareHeaders)
      .then(
        function(data) {
          // restaurant exists
          var newProperty = restaurant.Room + '_' + item.attributes[0].name;
          var schema = {};
          schema[newProperty] = {
            'type': 'PropertyValue',
            'additionalType': item.attributes[0].name,
            'propertyID': item.id,
            'name': restaurant.Room,
            'value': item.attributes[0].value
          };
          var fwHeaders = JSON.parse(JSON.stringify(fiwareHeaders));
          if (typeof data.body.department !== 'undefined') {
            fwHeaders['fiware-servicepath'] = '/' + data.body.department;
          }
          // update restaurant
          return authRequest(
            '/v2/entities/' + restaurant.Name,
            'POST',
            schema,
            fwHeaders)
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
          // restaurant does not exist
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
