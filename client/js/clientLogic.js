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
var utils;

var clientLogic = (function() {

  function showAllRestaurants() {
    restaurantsAPI.getAllRestaurants(
      function(response) { //success
        var restaurants =
          restaurantsAPI.simplifyRestaurantsFormat(response);
        drawModule.addRestaurantstoMap(restaurants);
      },
      function(response) { //error
      utils.showMessage('Could not retrieve restaurants', 'alert-danger');
        console.error('Error while trying to retrieve all restaurants.');
        if (response) {
          console.error(response);
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
        utils.showMessage('Could not retrieve restaurants', 'alert-danger');
        console.error(
            'Error while trying to retrieve the restaurants of the ' +
            'organization: ' + organization);
        if (response) {
          console.error(response);
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
      function(response) {
        var error = document.createElement('H2');
        error.textContent = 'Cannot get reviews.';
        document.getElementById('popContent').appendChild(error);
        drawModule.openPopUpWindow();
        console.error('Error while trying to show restaurant reviews for ' +
          name);
        if (response) {
          console.error(response);
        }
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
      function(response) {
        var error = document.createElement('H2');
        error.textContent = 'Cannot get reservations.';
        document.getElementById('popContent').appendChild(error);
        drawModule.openPopUpWindow();
        console.error('Error while trying to show restaurant reservations ' +
          ' for ' + name);
        if (response) {
          console.error(response);
        }
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
        utils.showMessage('Cannot get user reviews for: ' + username,
          'alert-danger');
        console.error('Error displaying reviews for the user ' + username);
        if (error) {
          console.error(error);
        }
      });
  }

  function showReviewsByOrganization(organization) {
    restaurantsAPI.getOrganizationReviews(organization,
      function(reviewsResponse) {
        drawModule.createOrganizationReviewsTable(reviewsResponse);
      },
      function(error) {
        utils.showMessage('Cannot get user reviews for: ' + organization,
          'alert-danger');
        console.error('Error displaying reviews for the organization ' +
          organization);
        if (error) {
          console.error(error);
        }
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
        utils.showMessage('Cannot get user reservations for: ' + username,
          'alert-danger');
        console.error('Error displaying reservations for the user ' + username);
        if (error) {
          console.error(error);
        }
      });
  }

  function showReservationsByOrganization(organization) {
    restaurantsAPI.getOrganizationReservations(organization,
      function(reservationsResponse) {
        drawModule.createReservationsTable(reservationsResponse);
      },
      function(error) {
        utils.showMessage('Cannot get user reservations for: ' + organization,
          'alert-danger');
        console.error('Error displaying reservations for the organization ' +
          organization);
        if (error) {
          console.error(error);
        }
      });
  }

  function createNewReview(name, rating, description) {
    restaurantsAPI.createNewReview(name, rating, description,
      drawModule.closePopUpWindow,
      function(err) {
        utils.showMessage('Cannot add review', 'alert-danger');
        console.error('Error creating a new review: ' + name + ' ' + rating +
          ' ' + description);
        if (err) {
          console.error(err);
        }
      }
    );
  }

  function updateReview(reviewId, rating, description) {
    restaurantsAPI.updateReview(reviewId, rating, description,
      drawModule.closePopUpWindow,
      function(err) {
        utils.showMessage('Cannot update review', 'alert-danger');
        console.error('Error trying to update the review :' + reviewId +
          ' with:' + rating + ' ' + description);
        if (err) {
          console.error(err);
        }
      }
    );
  }

  function showReview(reviewId) {
    restaurantsAPI.getReview(reviewId, function(reviewResponse) {
      var restaurantReviewed =
        JSON.parse(reviewResponse)[0].itemReviewed.name;
      var reviewDiv = drawModule.createViewReviewDiv(reviewResponse);
      drawModule.setPopupTitle('Review for ' + restaurantReviewed);
      drawModule.setPopupContent(reviewDiv);
      drawModule.openPopUpWindow();
    },
    function(err) {
      utils.showMessage('Cannot get the specified review', 'alert-danger');
      console.error('Error retrieving the review: ' + reviewId);
      if (err) {
        console.error(err);
      }
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
        drawModule.initializeReviewForm(review);
        drawModule.openPopUpWindow();
      },
      function(err) {
        utils.showMessage('Error retrieving the review', 'alert-danger');
        console.error('Error trying to update the review: ' + reviewId);
        if (err) {
          console.error(err);
        }
      });
  }

  function createNewReservation(name, partySize, time) {
    restaurantsAPI.createNewReservation(name, partySize, time,
      drawModule.closePopUpWindow,
      function(err) {
        utils.showMessage('Cannot add reservation', 'alert-danger');
        console.error('Error trying to create a new reservation using: ' +
          name + ' ' + partySize + ' ' + time);
        if (err) {
          console.error(err);
        }
      }
    );
  }

  function deleteReview(reviewId) {
    restaurantsAPI.deleteReview(reviewId,
      function() {
        location.reload();
      },
      function(err) {
        utils.showMessage('Could not delete the reservation.', 'alert-danger');
        console.error('Error while trying to delete the review: ' + reviewId);
        if (err) {
          console.error(err);
        }
      });
  }

  function cancelReservation(reservationId) {
    restaurantsAPI.cancelReservation(reservationId,
      function() {
        location.reload();
      },
      function(err) {
        utils.showMessage('Could not delete the review.', 'alert-danger');
        console.error('Error while trying to cancel the reservation: ' +
          reservationId);
        if (err) {
          console.error(err);
        }
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
