'use strict';
/*
 * clientLogic.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors:
 *   Jaisiel Santana <jaisiel@gmail.com>
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

  This module specifies the client application behaviour.
  It connects restaurantsAPI with drawModule.

*/

/*exported clientLogic */

var connectionsAPI;
var drawModule;
var restaurantsAPI;

var clientLogic = (function() {

  function showAllRestaurants() {
    restaurantsAPI.getAllRestaurants(
      function(response) { //success
        var restaurants =
          restaurantsAPI.simplifyRestaurantsFormat(response);
        drawModule.addRestaurantstoMap(restaurants);
      },
      function(response) { //error
        alert('Could not retrieve restaurants');
        if (response) {
          console.log(response);
        }
      }
    );
  }

  function showOrganizationRestaurants(organization) {
    restaurantsAPI.getOrganizationRestaurants(
      organization,
      function(response) { //success
        var restaurants =
          restaurantsAPI.simplifyRestaurantsFormat(response);
        drawModule.addRestaurantstoMap(restaurants);
      },
      function(response) { //error
        alert('Could not retrieve restaurants');
        if (response) {
          console.log(response);
        }
      }
    );
  }


  function showRestaurantReviews(name) {

    restaurantsAPI.getRestaurantReviews(name,
      function(response) {
        var reviewsDiv = drawModule.createReviewsDiv(response);
        drawModule.setPopupTitle(name);
        drawModule.setPopupContent(reviewsDiv);
        drawModule.openPopUpWindow();
      },
      function() {
        var error = document.createElement('H2');
        error.textContent = 'Cannot get reviews.';
        document.getElementById('popContent').appendChild(error);
        drawModule.openPopUpWindow();
      }
    );
  }

  function showRestaurantReservations(name) {

    restaurantsAPI.getRestaurantReservations(name,
      function(response) {
        var reservationsDiv = drawModule.createReservationsDiv(response);
        drawModule.setPopupTitle(name);
        drawModule.setPopupContent(reservationsDiv);
        drawModule.openPopUpWindow();
      },
      function() {
        var error = document.createElement('H2');
        error.textContent = 'Cannot get reservations.';
        document.getElementById('popContent').appendChild(error);
        drawModule.openPopUpWindow();
      }
    );
  }


  function getMyReviews() {
    var username = connectionsAPI.getUser().displayName;
    if (username) {
      showReviewsByUser(username);
    }
  }

  function showReviewsByUser(username) {
    restaurantsAPI.getUserReviews(username,
      function(reviewsResponse) {
        drawModule.createReviewsTable(reviewsResponse);
      },
      function(error) {
        alert('Cannot get user reviews for: ' + username);
        console.log(error);
      });
  }
  function showReviewsByOrganization(organization) {
    restaurantsAPI.getOrganizationReviews(organization,
      function(reviewsResponse) {
        drawModule.createOrganizationReviewsTable(reviewsResponse);
      },
      function(error) {
        alert('Cannot get user reviews for: ' + organization);
        console.log(error);
      });
  }


  function getMyReservations() {
    var username = connectionsAPI.getUser().displayName;
    if (username) {
      showReservationsByUser(username);
    }
  }

  function showReservationsByUser(username) {
    restaurantsAPI.getUserReservations(username,
      function(reservationsResponse) {
        drawModule.createReservationsTable(reservationsResponse);
      },
      function(error) {
        alert('Cannot get user reservations for: ' + username);
        console.log(error);
      });
  }


  function showReservationsByOrganization(organization) {
    restaurantsAPI.getOrganizationReservations(organization,
      function(reservationsResponse) {
        drawModule.createReservationsTable(reservationsResponse);
      },
      function(error) {
        alert('Cannot get user reservations for: ' + organization);
        console.log(error);
      });
  }

  function createNewReview(name, rating, description) {

    restaurantsAPI.createNewReview(name, rating, description,
      drawModule.closePopUpWindow,
      function(err) {
        alert('Cannot add review');
        console.log(err);
      }
    );
  }

  function updateReview(reviewId, rating, description) {

    restaurantsAPI.updateReview(reviewId, rating, description,
      drawModule.closePopUpWindow,
      function(err) {
        alert('Cannot update review');
        console.log(err);
      }
    );
  }

  function showReview(reviewId) {

    restaurantsAPI.getReview(reviewId, function(reviewResponse) {
      //'Edit review ' + ' for ' + review.itemReviewed.name;
      var restaurantReviewed =
        JSON.parse(reviewResponse)[0].itemReviewed.name;
      var reviewDiv = drawModule.createViewReviewDiv(reviewResponse);
      drawModule.setPopupTitle('Review for ' + restaurantReviewed);
      drawModule.setPopupContent(reviewDiv);
      drawModule.openPopUpWindow();
    },
    function(err) {
      alert('Cannot get the specified review');
      console.log(err);
    });

  }

  function showUpdateReviewForm(reviewId) {
    restaurantsAPI.getReview(reviewId,
      function(reviewResponse) {
        var review = JSON.parse(reviewResponse)[0];
        var formDiv =
          drawModule.createReviewForm(review.itemReviewed.name, review);
        drawModule.setPopupTitle(
          'Edit Review for ' + review.itemReviewed.name);
        drawModule.setPopupContent(formDiv);
        drawModule.inicializeReviewForm(review);
        drawModule.openPopUpWindow();
      },
      function(err) {
        alert('Error retrieving the review');
        console.log(err);
      });
  }

  function createNewReservation(name, partySize, time) {

    restaurantsAPI.createNewReservation(name, partySize, time,
      drawModule.closePopUpWindow,
      function(err) {
        alert('Cannot add reservation');
        console.log(err);
      }
    );
  }

  function deleteReview(reviewId) {
    restaurantsAPI.deleteReview(reviewId,
      function() {
        location.reload();
      },
      function(err) {
        alert('Could not delete the reservation.');
        console.log(err);
      });
  }

  function cancelReservation(reservationId) {
    restaurantsAPI.cancelReservation(reservationId,
      function() {
        location.reload();
      },
      function(err) {
        alert('Could not delete the review.');
        console.log(err);
      });
  }


  /* This function sets the method to be used for the different
  operations performed from the graphic interface */
  function setUpDrawModule() {
    drawModule.setViewRestaurantReviewsAction(showRestaurantReviews);
    drawModule.setViewReservationAction(showRestaurantReservations);
    drawModule.setCreateNewReviewAction(createNewReview);
    drawModule.setCreateNewReservationAction(createNewReservation);
    drawModule.setGetReservationsByDateAction(
      restaurantsAPI.getRestaurantReservationsByDate);
    drawModule.setViewReviewAction(showReview);
    drawModule.setShowEditReviewAction(showUpdateReviewForm);
    drawModule.setUpdateReviewAction(updateReview);
    drawModule.setDeleteReviewAction(deleteReview);
    drawModule.setCancelReservationAction(cancelReservation);
  }


  return {
    showAllRestaurants: showAllRestaurants,
    showOrganizationRestaurants: showOrganizationRestaurants,
    showReservationsByOrganization: showReservationsByOrganization,
    showRestaurantReviews: showRestaurantReviews,
    showRestaurantReservations: showRestaurantReservations,
    showReviewsByUser: showReviewsByUser,
    showReviewsByOrganization: showReviewsByOrganization,
    createNewReview: createNewReview,
    createNewReservation: createNewReservation,
    deleteReview: deleteReview,
    updateReview: updateReview,
    showReservationsByUser: showReservationsByUser,
    getMyReviews: getMyReviews,
    getMyReservations: getMyReservations,
    setUpDrawModule: setUpDrawModule
  };
})();
