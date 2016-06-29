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

//global vars
var map; //map instance
var connectionsAPI;
var AJAXRequest;
var restaurantsAPI = (function() {
  var baseURL = 'http://tourguide/api/orion/';

  /* get all restaurants and show them */
  function getAllRestaurants(cb, err_cb) {
    AJAXRequest.get(baseURL + 'restaurants/', cb, err_cb);
  }

  function getOrganizationRestaurants(organization, cb, err_cb) {
    var URL = baseURL + 'restaurants/organization/' + organization;
    AJAXRequest.get(URL, cb, err_cb);
  }

  function getRestaurantReviews(name, cb, err_cb) {
    var URL = baseURL + 'reviews/restaurant/' + name;
    AJAXRequest.get(URL, cb, err_cb);
  }

  function getOrganizationReviews(name, cb, err_cb) {
    var URL = baseURL + 'reviews/organization/' + name;
    AJAXRequest.get(URL, cb, err_cb);
  }


  function getRestaurantReservations(name, cb, err_cb) {
    var URL = baseURL + 'reservations/restaurant/' + name;
    AJAXRequest.get(URL, cb, err_cb);
  }

  function getOrganizationReservations(name, cb, err_cb) {
    var URL = baseURL + 'reservations/organization/' + name;
    AJAXRequest.get(URL, cb, err_cb);
  }


  /*Simplify the restaurant format using only useful info */
  function simplifyRestaurantsFormat(restaurants) {
    restaurants = JSON.parse(restaurants);
    var convertedRestaurants = [];

    restaurants.forEach(function(restaurant) {
      convertedRestaurants.push(
        convertRestaurant(restaurant)
        );
    });

    return convertedRestaurants;
  }


  //return nothing if error
  function convertRestaurant(restaurant) {
    var convertedRestaurant = {'name': restaurant.name};

    //get desired attributes
    if (restaurant.address) {
      if (restaurant.address.streetAddress) {
        convertedRestaurant.address = restaurant.address.streetAddress;
      }
      else {
        console.log('Cannot get street address for ' + restaurant.name);
      }

      if (restaurant.address.addressLocality) {
        convertedRestaurant.locality = restaurant.address.addressLocality;
      }
      else {
        console.log('Cannot get locality address for ' + restaurant.name);
      }

      if (restaurant.address.addressRegion) {
        convertedRestaurant.region = restaurant.address.addressRegion;
      }
      else {
        console.log('Cannot get region address for ' + restaurant.name);
      }
    }
    else {
      console.log('Cannot get address for ' + restaurant.name);
    }

    if (restaurant.telephone) {
      convertedRestaurant.telephone = restaurant.telephone;
    }
    else {
      console.log('Cannot get telephone for ' + restaurant.name);
    }

    if (restaurant.description) {
      convertedRestaurant.description = restaurant.description;
    }
    else {
      console.log('Cannot get description for ' + restaurant.name);
    }

    if (restaurant.aggregateRating) {
      if (typeof restaurant.aggregateRating.ratingValue === 'number') {
        convertedRestaurant.ratingValue =
          restaurant.aggregateRating.ratingValue;
      }
      else {
        console.log('Cannot get ratingValue for ' + restaurant.name);
      }

      if (typeof restaurant.aggregateRating.reviewCount === 'number') {
        convertedRestaurant.reviewCount =
          restaurant.aggregateRating.reviewCount;
      }
      else {
        console.log('Cannot get reviewCount for ' + restaurant.name);
      }
    }
    else {
      console.log('Cannot get aggregate rating for' + restaurant.name);
    }

    convertedRestaurant.coords = [];

    if (restaurant.geo) {
      if (restaurant.geo.latitude) {
        convertedRestaurant.coords.push(parseFloat(restaurant.geo.latitude));
        if (isNaN(convertedRestaurant.coords[0])) {
          console.log('invalid latitude ' + restaurant.geo.latitude +
            ' for restaurant ' + restaurant.name);
          return;
        }
      }
      else {
        console.log('Cannot get latitude for ' + restaurant.name);
        return;
      }

      if (restaurant.geo.longitude) {
        convertedRestaurant.coords.push(parseFloat(restaurant.geo.longitude));
        if (isNaN(convertedRestaurant.coords[1])) {
          console.log('invalid longitude ' + restaurant.geo.longitude +
            ' for restaurant ' + restaurant.name);
          return;
        }
      }
      else {
        console.log('Cannot get longitude for ' + restaurant.name);
        return;
      }
    }
    else {
      console.log('Cannot get coordinates for ' + restaurant.name);
      return;
    }
    return convertedRestaurant;
  }


  function getRestaurantReservationsByDate(restaurantName, time,
    cb, err_cb) {

    var URL =
      baseURL + 'restaurant/' + restaurantName + '/date/' + time;
      AJAXRequest.get(URL, cb, err_cb);
  }


  function getReview(reviewId, cb, err_cb) {
    var URL = baseURL + 'review/' + reviewId;
    AJAXRequest.get(URL, cb, err_cb);
  }



  function createNewReview(
    restaurantName, ratingValue, reviewBody, cb, err_cb) {

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

    AJAXRequest.post(baseURL + 'review/', cb, err_cb, data);
  }

  function updateReview(reviewId, ratingValue, reviewBody, cb, err_cb) {

    var data = {
      'reviewBody': '' + reviewBody,
      'reviewRating': parseInt(ratingValue, 10)
    };

    var url = baseURL + 'review/' + reviewId;
    AJAXRequest.patch(url, cb, err_cb, data);
  }


  function createNewReservation(
    restaurantName, partySize, reservationDatetime, cb, err_cb) {

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
      cb, err_cb, data);
  }


  function getUserReservations(username, cb, err_cb) {
    var URL = baseURL + 'reservations/user/' + username;
    AJAXRequest.get(URL, cb, err_cb);
  }




  function cancelReservation(reservationId, cb, err_cb) {

    var URL = baseURL + 'reservation/' + reservationId;
    AJAXRequest.del(URL, cb, err_cb);
  }


  function getUserReviews(userName, cb, err_cb) {
    var URL = baseURL + 'reviews/user/' + userName;
    AJAXRequest.get(URL, cb, err_cb);

  }

  function deleteReview(reviewId, cb, err_cb) {

    var url = baseURL + 'review/' + reviewId;
    AJAXRequest.del(url, cb, err_cb);
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
