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

var config = require('../config');
var fiwareHeaders = {
  'fiware-service': config.fiwareService
};

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
      utils.sendRequest('POST', elementToOrion, null, req.headers)
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
      utils.sendRequest('POST', elementToOrion, null, req.headers)
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
  var timeframeQuery;
  var actualOccupancyLevels;
  var restaurantReservations;
  var occupancyLevelsObject;
  var restaurant;
  var fiwareHeaders;
  var actualDate = new Date().getTime();
  timeframeQuery = utils.getTimeframe(actualDate);
  utils.sendRequest('GET', {
        'type': 'FoodEstablishmentReservation',
        'q': timeframeQuery,
        'limit': 1000
      },
      null,
      req.headers)
    .then(function(data) {
      restaurantReservations = data.body;
      actualOccupancyLevels = utils.getOccupancyLevels(
        restaurantReservations,
        req.params.id);
      console.log(actualOccupancyLevels);
      occupancyLevelsObject = utils.updateOccupancyLevels(
        actualOccupancyLevels, actualDate);
      utils.getListByType('Restaurant', req.params.id, req.headers)
        .then(function(data) {
          restaurant = data.body;
          // add service path for the restaurant
          fiwareHeaders = JSON.parse(JSON.stringify(req.headers));
          if (typeof restaurant.department !== 'undefined' &&
            restaurant.department !== '') {
            fiwareHeaders['fiware-servicepath'] = '/' + restaurant.department;
          }
          utils.sendRequest('PATCH',
              occupancyLevelsObject,
              req.params.id,
              fiwareHeaders)
            .then(function(data) {
              utils.getListByType('Restaurant', req.params.id, req.headers)
                .then(function(data) {
                  res.statusCode = data.statusCode;
                  res.json(utils.dataToSchema(data.body));
                })
                .catch(function(err) {
                  res.statusCode = err.statusCode;
                  res.json(err.error);
                });
            })
            .catch(function(err) {
              res.statusCode = err.statusCode;
              res.json(err.error);
            });
        })
        .catch(function(err) {
          res.statusCode = err.statusCode;
          res.json(err.error);
        });
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};

exports.readRestaurantWithDate = function(req, res) {
  var timeframeQuery;
  var actualOccupancyLevels;
  var restaurantReservations;
  var occupancyLevelsObject;
  var restaurant;
  var fiwareHeaders;
  timeframeQuery = utils.getTimeframe(req.params.date);
  utils.sendRequest('GET', {
        'type': 'FoodEstablishmentReservation',
        'q': timeframeQuery,
        'limit': 1000
      },
      null,
      req.headers)
    .then(function(data) {
      restaurantReservations = data.body;
      actualOccupancyLevels = utils.getOccupancyLevels(
        restaurantReservations,
        req.params.id);
      console.log(actualOccupancyLevels);
      occupancyLevelsObject = utils.updateOccupancyLevels(
        actualOccupancyLevels, req.params.date);
      utils.getListByType('Restaurant', req.params.id, req.headers)
        .then(function(data) {
          restaurant = data.body;
          // add service path for the restaurant
          fiwareHeaders = JSON.parse(JSON.stringify(req.headers));
          if (typeof restaurant.department !== 'undefined' &&
            restaurant.department !== '') {
            fiwareHeaders['fiware-servicepath'] = '/' + restaurant.department;
          }
          utils.sendRequest('PATCH',
              occupancyLevelsObject,
              req.params.id,
              fiwareHeaders)
            .then(function(data) {
              utils.getListByType('Restaurant', req.params.id, req.headers)
                .then(function(data) {
                  res.statusCode = data.statusCode;
                  res.json(utils.dataToSchema(data.body));
                })
                .catch(function(err) {
                  res.statusCode = err.statusCode;
                  res.json(err.error);
                });
            })
            .catch(function(err) {
              res.statusCode = err.statusCode;
              res.json(err.error);
            });
        })
        .catch(function(err) {
          res.statusCode = err.statusCode;
          res.json(err.error);
        });
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.end();
    });
};

exports.updateRestaurant = function(req, res) {
  utils.sendRequest('PATCH', req.body, req.params.id, req.headers)
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.end();
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.json(err.error);
    });
};

exports.deleteRestaurant = function(req, res) {
  utils.sendRequest('DELETE', null, req.params.id, req.headers)
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.end();
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.json(err.error);
    });
};

// -- TODO: handle pagination over the whole set of restaurants

exports.getRestaurants = function(req, res) {
  utils.getListByType('Restaurant', null, req.headers)
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
  var organizationRestaurants = [];
  utils.getListByType('Restaurant', null, req.headers)
  .then(function(data) {
    organizationRestaurants = utils.getOrgRestaurants(
      req.params.org,
      data.body);
    res.statusCode = data.statusCode;
    res.json(utils.dataToSchema(organizationRestaurants));
  })
  .catch(function(err) {
    res.statusCode = err.statusCode;
    res.end();
  });
};

// Reviews

exports.createReview = function(req, res) {
  var elementToOrion = req.body;
  var restaurantName = elementToOrion.itemReviewed.name;
  var restaurantReviews;
  var aggregateRatings;
  // -- We first get information regarding the restaurant
  var fwHeaders = JSON.parse(JSON.stringify(req.headers));
  if (typeof fwHeaders['fiware-servicepath'] !== 'undefined') {
    delete fwHeaders['fiware-servicepath'];
  }
  utils.getListByType('Restaurant', restaurantName, fwHeaders)
    .then(function(data) {
      auth.getUserDataPromise(req)
        .then(function(data) {
          elementToOrion = utils.reviewToOrion(data, elementToOrion);
          utils.sendRequest('POST', elementToOrion, null, req.headers)
            .then(function(data) {
              utils.getListByType('Review', null, fwHeaders)
                .then(function(data) {
                  restaurantReviews = utils.getRestaurantReviews(
                    restaurantName,
                    data.body);
                  aggregateRatings = utils.getAggregateRating(
                    restaurantReviews);
                  utils.sendRequest('PATCH', aggregateRatings,
                                    restaurantName, req.headers)
                    .then(function(data) {
                      res.end();
                    })
                    .catch(function(err) {
                      res.statusCode = err.statusCode;
                      res.json(err.error);
                    });
                })
                .catch(function(err) {
                  res.statusCode = err.statusCode;
                  res.json(err.error);
                });
              res.headers = data.headers;
              res.location('/api/orion/review/' + elementToOrion.id);
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
          res.json(JSON.parse(err.data));
        });
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.json(err.error);
    });
};

exports.readReview = function(req, res) {
  utils.getListByType('Review', req.params.id, req.headers)
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.json(utils.dataToSchema(data.body));
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.json(err.error);
    });
};

exports.updateReview = function(req, res) {
  var restaurantReviews;
  var aggregateRatings;
  var restaurantName;
  var userId;
  var servicePath;
  var fixedReviewObject;
  utils.getListByType('Review', req.params.id, req.headers)
    .then(function(data) {
      restaurantName = data.body.itemReviewed.name;
      userId = data.body.author.name;
      auth.getUserDataPromise(req)
        .then(function(data) {
          if (userId !== data.id) {
            res.statusCode = 403;
            res.json({
              error: {
                message: 'The resource you are trying to access is forbidden',
                code: 403,
                title: 'Forbidden'
              }
            });
          } else {
            fixedReviewObject = req.body;
            if (fixedReviewObject.reviewBody) {
              fixedReviewObject.reviewBody = utils.fixedEncodeURIComponent(
                fixedReviewObject.reviewBody);
            }
            utils.sendRequest('PATCH', fixedReviewObject, req.params.id,
                req.headers)
              .then(function(data) {
                var fwHeaders = JSON.parse(JSON.stringify(req.headers));
                if (typeof fwHeaders['fiware-servicepath'] !==
                  'undefined') {
                  delete fwHeaders['fiware-servicepath'];
                }
                utils.getListByType('Review', null, fwHeaders)
                  .then(function(data) {
                    restaurantReviews = utils.getRestaurantReviews(
                      restaurantName,
                      data.body);
                    aggregateRatings = utils.getAggregateRating(
                      restaurantReviews);
                    utils.getListByType('Restaurant', restaurantName,
                        req.headers)
                      .then(function(data) {
                        servicePath = data.body.department;
                        req.headers['fiware-servicepath'] = '/' +
                          servicePath;
                        utils.sendRequest('PATCH', aggregateRatings,
                            restaurantName, req.headers)
                          .then(function(data) {
                            res.end();
                          })
                          .catch(function(err) {
                            res.statusCode = err.statusCode;
                            res.json(err.error);
                          });
                      })
                      .patch(function(err) {
                        res.statusCode = err.statusCode;
                        res.json(err.error);
                      });
                  })
                  .catch(function(err) {
                    res.statusCode = err.statusCode;
                    res.json(err.error);
                  });
                res.statusCode = data.statusCode;
                res.end();
              })
              .catch(function(err) {
                res.statusCode = err.statusCode;
                res.json(err.error);
              });
          }
        })
        .catch(function(err) {
          res.statusCode = err.statusCode;
          res.json(JSON.parse(err.data));
        });
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.json(err.error);
    });
};

exports.deleteReview = function(req, res) {
  var restaurantReviews;
  var aggregateRatings;
  var restaurantName;
  var servicePath;
  utils.getListByType('Review', req.params.id, req.headers)
    .then(function(data) {
      restaurantName = data.body.itemReviewed.name;
      utils.getListByType('Restaurant', restaurantName, req.headers)
        .then(function(data) {
          servicePath = data.body.department;
          utils.sendRequest('DELETE', null, req.params.id, req.headers)
            .then(function(data) {
              utils.getListByType('Review', null, req.headers)
                .then(function(data) {
                  restaurantReviews = utils.getRestaurantReviews(
                    restaurantName,
                    data.body);
                  aggregateRatings = utils.getAggregateRating(
                    restaurantReviews);
                  req.headers['fiware-servicepath'] = '/' + servicePath;
                  utils.sendRequest('PATCH', aggregateRatings,
                      restaurantName, req.headers)
                    .then(function(data) {
                      res.end();
                    })
                    .catch(function(err) {
                      res.statusCode = err.statusCode;
                      res.json(err.error);
                    });
                })
                .catch(function(err) {
                  res.statusCode = err.statusCode;
                  res.json(err.error);
                });
              res.statusCode = data.statusCode;
              res.end();
            })
            .catch(function(err) {
              res.statusCode = err.statusCode;
              res.json(err.error);
            });
        })
        .catch(function(err) {
          res.statusCode = err.statusCode;
          res.json(err.error);
        });
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.json(err.error);
    });
};

exports.getReviews = function(req, res) {
  utils.getListByType('Review', null, req.headers)
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
  var userReviews = [];
  utils.getListByType('Review', null, req.headers)
  .then(function(data) {
    userReviews = utils.getUserReviews(req.params.user, data.body);
    res.statusCode = data.statusCode;
    res.json(utils.dataToSchema(userReviews));
  })
  .catch(function(err) {
    res.statusCode = err.statusCode;
    res.end();
  });
};

exports.getRestaurantReviews = function(req, res) {
  var restaurantReviews = [];
  utils.getListByType('Review', null, req.headers)
  .then(function(data) {
    restaurantReviews = utils.getRestaurantReviews(
      req.params.restaurant,
      data.body);
    res.statusCode = data.statusCode;
    res.json(utils.dataToSchema(restaurantReviews));
  })
  .catch(function(err) {
    res.statusCode = err.statusCode;
    res.end();
  });
};

exports.getOrganizationReviews = function(req, res) {
  var organizationReviews = [];
  utils.getListByType('Review', null, req.headers)
  .then(function(reviews) {
    utils.getListByType('Restaurant', null, req.headers)
    .then(function(restaurants) {
      organizationReviews = utils.getOrgReviews(
        req.params.org,
        restaurants.body,
        reviews.body);
      res.statusCode = restaurants.statusCode;
      res.json(utils.dataToSchema(organizationReviews));
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

// Reservations

exports.createReservation = function(req, res) {
  var elementToOrion;
  var restaurantReservations;
  var capacity;
  var actualOccupancyLevels;
  var timeframeQuery;
  // -- We first get information regarding the restaurant
  utils.getListByType('Restaurant',
                      req.body.reservationFor.name,
                      req.headers)
  .then(function(data) {
    elementToOrion = req.body;
    elementToOrion.reservationFor.address = data.body.address;
    capacity = data.body.capacity.value;
    timeframeQuery = utils.getTimeframe(req.body.startTime);
    utils.sendRequest('GET',
      {'type': 'FoodEstablishmentReservation',
      'q': timeframeQuery,
      'limit': 1000},
      null,
      req.headers)
    .then(function(data) {
      restaurantReservations = data.body;
      actualOccupancyLevels = utils.getOccupancyLevels(
        restaurantReservations,
        req.body.reservationFor.name);

      if (actualOccupancyLevels + req.body.partySize > capacity) {
        res.statusCode = 409;
        res.json({
          error: {
            message: 'The ocuppancy levels have reached its limit',
            code: 409,
            title: 'Conflict'
          }
        });
      } else {
        auth.getUserDataPromise(req)
        .then(function(data) {
          elementToOrion = utils.reservationToOrion(data, elementToOrion);
          utils.sendRequest('POST', elementToOrion, null, req.headers)
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
          res.json(JSON.parse(err.data));
        });
      }
    })
    .catch(function(err) {

    });
  })
  .catch(function(err) {
    res.statusCode = err.statusCode;
    res.json(err.error);
  });
};

exports.readReservation = function(req, res) {
  utils.getListByType('FoodEstablishmentReservation',
                      req.params.id,
                      req.headers)
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.json(utils.dataToSchema(data.body));
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.json(err.error);
    });
};

exports.updateReservation = function(req, res) {
  var restaurantName;
  var userId;
  utils.getListByType('FoodEstablishmentReservation',
                      req.params.id,
                      req.headers)
  .then(function(data) {
    userId = data.body.underName.name;
    auth.getUserDataPromise(req)
    .then(function(data) {
      if (userId !== data.id) {
        res.statusCode = 403;
        res.json({
          error: {
            message: 'The resource you are trying to access is forbidden',
            code: 403,
            title: 'Forbidden'
          }
        });
      } else {
        utils.sendRequest('PATCH', req.body, req.params.id, req.headers)
        .then(function(data) {
          res.statusCode = data.statusCode;
          res.end();
        })
        .catch(function(err) {
          res.statusCode = err.statusCode;
          res.json(err.error);
        });
      }
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.json(JSON.parse(err.data));
    });
  })
  .catch(function(err) {
    res.statusCode = err.statusCode;
    res.json(err.error);
  });
};

exports.deleteReservation = function(req, res) {
  utils.sendRequest('DELETE', null, req.params.id, req.headers)
    .then(function(data) {
      res.statusCode = data.statusCode;
      res.end();
    })
    .catch(function(err) {
      res.statusCode = err.statusCode;
      res.json(err.error);
    });
};
exports.getReservations = function(req, res) {
  utils.getListByType('FoodEstablishmentReservation', null, req.headers)
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
  var userReservations = [];
  utils.getListByType('FoodEstablishmentReservation', null, req.headers)
  .then(function(data) {
    userReservations = utils.getUserReservations(
      req.params.user,
      data.body);
    res.statusCode = data.statusCode;
    res.json(utils.dataToSchema(userReservations));
  })
  .catch(function(err) {
    res.statusCode = err.statusCode;
    res.end();
  });
};

exports.getRestaurantReservations = function(req, res) {
  var restaurantReservations = [];
  utils.getListByType('FoodEstablishmentReservation', null, req.headers)
  .then(function(data) {
    restaurantReservations = utils.getRestaurantReservations(
      req.params.restaurant,
      data.body);
    res.statusCode = data.statusCode;
    res.json(utils.dataToSchema(restaurantReservations));
  })
  .catch(function(err) {
    res.statusCode = err.statusCode;
    res.end();
  });
};

exports.getOrganizationReservations = function(req, res) {
  var organizationsReservations = [];
  utils.getListByType('FoodEstablishmentReservation', null, req.headers)
  .then(function(reservations) {
    utils.getListByType('Restaurant', null, req.headers)
    .then(function(restaurants) {
      organizationsReservations = utils.getOrgReservations(
        req.params.org,
        restaurants.body,
        reservations.body);
      res.statusCode = restaurants.statusCode;
      res.json(utils.dataToSchema(organizationsReservations));
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

exports.getReservationsByDate = function(req, res) {
  var restaurantReservations = [];
  var timeframeQuery = utils.getTimeBetweenDates(
    req.params.from,
    req.params.to);
  utils.sendRequest('GET',
    {'type': 'FoodEstablishmentReservation',
    'q': timeframeQuery,
    'limit': 1000},
    null,
    req.headers)
  .then(function(data) {
    restaurantReservations = utils.getRestaurantReservations(
      req.params.restaurant,
      data.body);
    res.statusCode = data.statusCode;
    res.json(utils.dataToSchema(restaurantReservations));
  })
  .catch(function(err) {
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
