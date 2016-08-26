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

var RESTAURANT_TYPE = 'Restaurant';
var REVIEW_TYPE = 'Review';
var RESERVATION_TYPE = 'FoodEstablishmentReservation';

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

tv4.addSchema('restaurant', schema.restaurant);
tv4.addSchema('reservation', schema.reservation);
tv4.addSchema('review', schema.review);

/**
 * Restaurants
*/

/**
 * Function used to POST at /api/orion/restaurant and generate a Restaurant
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
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

/**
 * Function used to GET a restaurant at /api/orion/restaurant/:id
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
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
  utils.getListByType(RESERVATION_TYPE, null, req.headers, queryString)
  .then(function(reservations) {
    occupancyLevelsObject = utils.updateOccupancyLevels(reservations.body,
                                                        currentDate);
    return utils.getListByType(RESTAURANT_TYPE, restaurantId, req.headers);
  })
  .then(function(restaurant) {
    servicePath = restaurant.body.department;
    fiwareHeaders = utils.completeHeaders(req.headers, servicePath);
    return utils.sendRequest('PATCH', occupancyLevelsObject, restaurantId,
                             fiwareHeaders);
  })
  .then(function(patchResponse) {
    return utils.getListByType(RESTAURANT_TYPE, restaurantId, req.headers);
  })
  .then(function(restaurant) {
    utils.returnResponse(restaurant, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

/**
 * Function used to GET a restaurant with a given date
 * at /api/orion/restaurant/:id/date/:date
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
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
  utils.getListByType(RESERVATION_TYPE, null, req.headers, queryString)
  .then(function(reservations) {
    occupancyLevelsObject = utils.updateOccupancyLevels(reservations.body,
                                                        req.params.date);
    return utils.getListByType(RESTAURANT_TYPE, restaurantId, req.headers);
  })
  .then(function(restaurant) {
    servicePath = restaurant.body.department;
    fiwareHeaders = utils.completeHeaders(req.headers, servicePath);
    return utils.sendRequest('PATCH', occupancyLevelsObject, restaurantId,
                             fiwareHeaders);
  })
  .then(function(patchResponse) {
    return utils.getListByType(RESTAURANT_TYPE, restaurantId, req.headers);
  })
  .then(function(restaurant) {
    utils.returnResponse(restaurant, res, req.params.date);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

/**
 * Function used to PATCH a restaurant at /api/orion/restaurant/:id
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
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

/**
 * Function used to DELETE a restaurant at /api/orion/restaurant/:id
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
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

/**
 * Function used to GET a list of restaurants at /api/orion/restaurants
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
exports.getRestaurants = function(req, res) {
  utils.getListByType(RESTAURANT_TYPE, null, req.headers)
  .then(function(restaurants) {
    utils.returnResponse(restaurants, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

/**
 * Function used to GET a list of restaurants with a given organization
 * at /api/orion/restaurants/organization/:org
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
exports.getOrganizationRestaurants = function(req, res) {
  var filter = [];
  var queryString = {};
  utils.addConditionToQuery(filter, 'department', '==', req.params.org);
  queryString.q = filter.join(';');
  utils.getListByType(RESTAURANT_TYPE, null, req.headers, queryString)
  .then(function(restaurants) {
    utils.returnResponse(restaurants, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

/**
 * Reviews
*/

/**
 * Function used to POST at /api/orion/review and generate a Review
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
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
    utils.getListByType(RESTAURANT_TYPE, restaurantId, req.headers)
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
      return utils.getListByType(REVIEW_TYPE, null, req.headers, queryString);
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

/**
 * Function used to GET a review at /api/orion/review/:id
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
exports.readReview = function(req, res) {
  var reviewId = req.params.id;
  utils.getListByType(REVIEW_TYPE, reviewId, req.headers)
  .then(function(review) {
    utils.returnResponse(review, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

/**
 * Function used to PATCH a review at /api/orion/review/:id
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
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
  utils.getListByType(REVIEW_TYPE, reviewId, req.headers)
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
        return utils.getListByType(REVIEW_TYPE, null, fiwareHeaders,
                                   queryString);
      })
      .then(function(reviews) {
        aggregateRatings = utils.getAggregateRating(reviews.body);
        return utils.getListByType(RESTAURANT_TYPE, restaurantId, req.headers);
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

/**
 * Function used to DELETE a review at /api/orion/review/:id
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
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
  utils.getListByType(REVIEW_TYPE, reviewId, req.headers)
  .then(function(review) {
    restaurantName = review.body.itemReviewed;
    restaurantId = utils.generateId(restaurantName);
    return utils.getListByType(RESTAURANT_TYPE, restaurantId, req.headers);
  })
  .then(function(restaurant) {
    servicePath = restaurant.body.department;
    return utils.sendRequest('DELETE', null, reviewId, req.headers);
  })
  .then(function(deleteResponse) {
    finalResponse = deleteResponse;
    utils.addConditionToQuery(filter, 'itemReviewed', '==', restaurantName);
    queryString.q = filter.join(';');
    return utils.getListByType(REVIEW_TYPE, null, req.headers, queryString);
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

/**
 * Function used to GET a list of reviews at /api/orion/reviews
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
exports.getReviews = function(req, res) {
  utils.getListByType(REVIEW_TYPE, null, req.headers)
  .then(function(reviews) {
    utils.returnResponse(reviews, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

/**
 * Function used to GET a list of reviews of a given user
 * at /api/orion/reviews/user/:user
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
exports.getUserReviews = function(req, res) {
  var filter = [];
  var queryString = {};
  utils.addConditionToQuery(filter, 'author', '==', req.params.user);
  queryString.q = filter.join(';');
  utils.getListByType(REVIEW_TYPE, null, req.headers, queryString)
  .then(function(reviews) {
    utils.returnResponse(reviews, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

/**
 * Function used to GET a list of reviews of a given restaurant
 * at /api/orion/reviews/restaurant/:restaurant
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
exports.getRestaurantReviews = function(req, res) {
  var filter = [];
  var queryString = {};
  utils.addConditionToQuery(filter, 'itemReviewed', '==',
                            req.params.restaurant);
  queryString.q = filter.join(';');
  utils.getListByType(REVIEW_TYPE, null, req.headers, queryString)
  .then(function(reviews) {
    utils.returnResponse(reviews, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

/**
 * Function used to GET a list of reviews of a given organization
 * at /api/orion/reviews/organization/:org
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
exports.getOrganizationReviews = function(req, res) {
  var filter = [];
  var queryString = {};
  utils.addConditionToQuery(filter, 'publisher', '==', req.params.org);
  queryString.q = filter.join(';');
  utils.getListByType(REVIEW_TYPE, null, req.headers, queryString)
  .then(function(reviews) {
    utils.returnResponse(reviews, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

/**
 * Reservations
*/

/**
 * Function used to POST at /api/orion/reservation and generate a Reservation
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
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
    utils.getListByType(RESTAURANT_TYPE, restaurantId, req.headers)
    .then(function(restaurant) {
      elementToOrion.address = restaurant.body.address;
      capacity = restaurant.body.capacity;
      utils.addConditionToQuery(filter, 'startTime', '==', timeframe);
      utils.addConditionToQuery(filter, 'reservationStatus', '==', 'Confirmed');
      utils.addConditionToQuery(filter, 'reservationFor', '==',
                                req.body.reservationFor.name);
      queryString.q = filter.join(';');
      return utils.getListByType(RESERVATION_TYPE, null, req.headers,
                                 queryString);
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

/**
 * Function used to GET a reservation at /api/orion/reservation/:id
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
exports.readReservation = function(req, res) {
  var reservationId = req.params.id;
  utils.getListByType(RESERVATION_TYPE, reservationId, req.headers)
  .then(function(reservation) {
    utils.returnResponse(reservation, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

/**
 * Function used to PATCH a review at /api/orion/review/:id
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
exports.updateReservation = function(req, res) {
  var restaurantName;
  var userId;
  var reservationId = req.params.id;
  var keyValues = {'options': 'keyValues'};
  utils.getListByType(RESERVATION_TYPE, reservationId, req.headers)
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

/**
 * Function used to DELETE a reservation at /api/orion/reservation/:id
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
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

/**
 * Function used to GET a list of reservations at /api/orion/reservations
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
exports.getReservations = function(req, res) {
  utils.getListByType(RESERVATION_TYPE, null, req.headers)
  .then(function(reservations) {
    utils.returnResponse(reservations, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

/**
 * Function used to GET a list of reservations of a given user
 * at /api/orion/reservations/user/:user
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
exports.getUserReservations = function(req, res) {
  var filter = [];
  var queryString = {};
  utils.addConditionToQuery(filter, 'underName', '==', req.params.user);
  queryString.q = filter.join(';');
  utils.getListByType(RESERVATION_TYPE, null, req.headers, queryString)
  .then(function(reservations) {
    utils.returnResponse(reservations, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

/**
 * Function used to GET a list of reservations of a given restaurant
 * at /api/orion/reservations/restaurant/:restaurant
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
exports.getRestaurantReservations = function(req, res) {
  var filter = [];
  var queryString = {};
  utils.addConditionToQuery(filter, 'reservationFor', '==',
                            req.params.restaurant);
  queryString.q = filter.join(';');
  utils.getListByType(RESERVATION_TYPE, null, req.headers, queryString)
  .then(function(reservations) {
    utils.returnResponse(reservations, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};

/**
 * Function used to GET a list of reviews of a given organization
 * at /api/orion/reservations/organization/:org
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
exports.getOrganizationReservations = function(req, res) {
  var filter = [];
  var queryString = {};
  var organizationsReservations;
  var restaurantList;
  utils.addConditionToQuery(filter, 'department', '==', req.params.org);
  queryString.q = filter.join(';');
  utils.getListByType(RESTAURANT_TYPE, null, req.headers, queryString)
  .then(function(restaurants) {
    restaurantList = restaurants.body;
    return utils.getListByType(RESERVATION_TYPE, null, req.headers);
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

/**
 * Function used to GET a list of reviews of a given restaurant and date
 * at /api/orion/reservations/restaurant/:restaurant/from/:from/to/:to
 *
 * @param {Object} req - Request received
 * @param {Object} res - Response
*/
exports.getReservationsByDate = function(req, res) {
  var timeframe = utils.getTimeBetweenDates(req.params.from, req.params.to);
  var filter = [];
  var queryString = {};
  utils.addConditionToQuery(filter, 'startTime', '==', timeframe);
  utils.addConditionToQuery(filter, 'reservationFor', '==',
                            req.params.restaurant);
  queryString.q = filter.join(';');
  utils.getListByType(RESERVATION_TYPE, null, req.headers, queryString)
  .then(function(reservations) {
    utils.returnResponse(reservations, res);
  })
  .catch(function(err) {
    utils.responseError(err, res);
  });
};
