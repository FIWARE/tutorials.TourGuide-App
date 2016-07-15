'use strict';
/*
 * restaurantsAPI.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors:
 *   Jaisiel Santana <jaisiel@gmail.com>
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

  Module that contains wraps to the tourguide application.
  It also provides some functions to simplify the responses

*/

/*exported restaurantsAPI */

// global vars
var map; // map instance
var connectionsAPI;
var AJAXRequest;
var restaurantsAPI = (function() {
  var baseURL = 'http://tourguide/api/orion/';

  /* get all restaurants and show them */
  function getAllRestaurants(cb, errCb) {
    AJAXRequest.get(baseURL + 'restaurants/', cb, errCb);
  }

  function getOrganizationRestaurants(organization, cb, errCb) {
    var URL = baseURL + 'restaurants/organization/' + organization;
    AJAXRequest.get(URL, cb, errCb);
  }

  function getRestaurantReviews(name, cb, errCb) {
    var URL = baseURL + 'reviews/restaurant/' + name;
    AJAXRequest.get(URL, cb, errCb);
  }

  function getOrganizationReviews(name, cb, errCb) {
    var URL = baseURL + 'reviews/organization/' + name;
    AJAXRequest.get(URL, cb, errCb);
  }

  function getRestaurantReservations(name, cb, errCb) {
    var URL = baseURL + 'reservations/restaurant/' + name;
    AJAXRequest.get(URL, cb, errCb);
  }

  function getOrganizationReservations(name, cb, errCb) {
    var URL = baseURL + 'reservations/organization/' + name;
    AJAXRequest.get(URL, cb, errCb);
  }

  /* Simplify the restaurant format using only useful info */
  function simplifyRestaurantsFormat(restaurants) {
    restaurants = JSON.parse(restaurants);
    return restaurants.map(convertRestaurant);
  }

  // return nothing if error
  function convertRestaurant(restaurant) {
    var convertedRestaurant = {'name': restaurant.name};

    // get desired attributes
    if (restaurant.address) {
      if (restaurant.address.streetAddress) {
        convertedRestaurant.address = restaurant.address.streetAddress;
      }
      else {
        console.error('Cannot get street address for ' + restaurant.name);
      }

      if (restaurant.address.addressLocality) {
        convertedRestaurant.locality = restaurant.address.addressLocality;
      }
      else {
        console.error('Cannot get locality address for ' + restaurant.name);
      }

      if (restaurant.address.addressRegion) {
        convertedRestaurant.region = restaurant.address.addressRegion;
      }
      else {
        console.error('Cannot get region address for ' + restaurant.name);
      }
    }
    else {
      console.error('Cannot get address for ' + restaurant.name);
    }

    if (restaurant.telephone) {
      convertedRestaurant.telephone = restaurant.telephone;
    }
    else {
      console.error('Cannot get telephone for ' + restaurant.name);
    }

    if (restaurant.description) {
      convertedRestaurant.description = restaurant.description;
    }
    else {
      console.error('Cannot get description for ' + restaurant.name);
    }

    if (restaurant.aggregateRating) {
      if (typeof restaurant.aggregateRating.ratingValue === 'number') {
        convertedRestaurant.ratingValue =
          restaurant.aggregateRating.ratingValue;
      }
      else {
        console.error('Cannot get ratingValue for ' + restaurant.name);
      }

      if (typeof restaurant.aggregateRating.reviewCount === 'number') {
        convertedRestaurant.reviewCount =
          restaurant.aggregateRating.reviewCount;
      }
      else {
        console.error('Cannot get reviewCount for ' + restaurant.name);
      }
    }
    else {
      console.error('Cannot get aggregate rating for' + restaurant.name);
    }

    convertedRestaurant.coords = [];

    if (restaurant.geo) {
      if (restaurant.geo.latitude) {
        convertedRestaurant.coords.push(parseFloat(restaurant.geo.latitude));
        if (isNaN(convertedRestaurant.coords[0])) {
          console.error('invalid latitude ' + restaurant.geo.latitude +
            ' for restaurant ' + restaurant.name);
          return;
        }
      }
      else {
        console.error('Cannot get latitude for ' + restaurant.name);
        return;
      }

      if (restaurant.geo.longitude) {
        convertedRestaurant.coords.push(parseFloat(restaurant.geo.longitude));
        if (isNaN(convertedRestaurant.coords[1])) {
          console.error('invalid longitude ' + restaurant.geo.longitude +
            ' for restaurant ' + restaurant.name);
          return;
        }
      }
      else {
        console.error('Cannot get longitude for ' + restaurant.name);
        return;
      }
    }
    else {
      console.error('Cannot get coordinates for ' + restaurant.name);
      return;
    }
    return convertedRestaurant;
  }

  function getRestaurantReservationsByDate(restaurantName, time, cb, errCb) {
    var URL =
      baseURL + 'restaurant/' + restaurantName + '/date/' + time;
      AJAXRequest.get(URL, cb, errCb);
  }

  function getReview(reviewId, cb, errCb) {
    var URL = baseURL + 'review/' + reviewId;
    AJAXRequest.get(URL, cb, errCb);
  }

  function createNewReview(restaurantName, ratingValue, reviewBody, cb, errCb) {
    var data = {
      '@type': 'Review',
      'itemReviewed': {
        '@type': 'Restaurant',
        'name': '' + restaurantName,
      },
      'name': 'Rating description',
      'reviewBody': '' + reviewBody,
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': parseInt(ratingValue, 10)
      }
    };

    AJAXRequest.post(baseURL + 'review/', cb, errCb, data);
  }

  function updateReview(reviewId, ratingValue, reviewBody, cb, errCb) {
    var data = {
      'reviewBody': '' + reviewBody,
      'reviewRating': parseInt(ratingValue, 10)
    };

    var url = baseURL + 'review/' + reviewId;
    AJAXRequest.patch(url, cb, errCb, data);
  }

  function createNewReservation(
    restaurantName, partySize, reservationDatetime, cb, errCb) {

    var data = {
      '@type': 'FoodEstablishmentReservation',
      'partySize': partySize,
      'reservationFor': {
        '@type': 'FoodEstablishment',
        'name': '' + restaurantName
      },
      'startTime': reservationDatetime.toISOString()
    };

    AJAXRequest.post(baseURL + 'reservation/',
      cb, errCb, data);
  }

  function getUserReservations(username, cb, errCb) {
    var URL = baseURL + 'reservations/user/' + username;
    AJAXRequest.get(URL, cb, errCb);
  }

  function cancelReservation(reservationId, cb, errCb) {
    var URL = baseURL + 'reservation/' + reservationId;
    AJAXRequest.del(URL, cb, errCb);
  }

  function getUserReviews(userName, cb, errCb) {
    var URL = baseURL + 'reviews/user/' + userName;
    AJAXRequest.get(URL, cb, errCb);
  }

  function deleteReview(reviewId, cb, errCb) {
    var url = baseURL + 'review/' + reviewId;
    AJAXRequest.del(url, cb, errCb);
  }

  function setMap(newMap) {
    map = newMap;
  }

  return {
    getAllRestaurants: getAllRestaurants,
    getUserReservations: getUserReservations,
    getUserReviews: getUserReviews,
    getOrganizationRestaurants: getOrganizationRestaurants,
    getOrganizationReservations: getOrganizationReservations,
    getOrganizationReviews: getOrganizationReviews,
    getRestaurantReviews: getRestaurantReviews,
    getRestaurantReservations: getRestaurantReservations,
    getRestaurantReservationsByDate: getRestaurantReservationsByDate,
    getReview: getReview,
    createNewReview: createNewReview,
    createNewReservation: createNewReservation,
    updateReview: updateReview,
    deleteReview: deleteReview,
    cancelReservation: cancelReservation,
    simplifyRestaurantsFormat: simplifyRestaurantsFormat,
    setMap: setMap
  };
})();

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = restaurantsAPI;
    AJAXRequest = require('./AJAXRequest.js');
    connectionsAPI = require('./connectionsAPI.js');
  }
}
