'use strict';
/*
 * drawModule.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors:
 *   Jaisiel Santana <jaisiel@gmail.com>
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

  This module contains the procedures to render
  the restaurants and their information

*/

/*exported drawModule */
var map; //map instance
var connectionsAPI;
var utils;
var drawModule = (function() {

  var maxRating = 5;
  var alreadyPartySizeInit = false;
  var minTime = {
    hours: 12,
    minutes: 30
  };
  var maxTime = {
    hours: 22,
    minutes: 30
  };

  //actions do nothing by default
  var viewReservationAction = function() {};
  var viewRestaurantReviewsAction = function() {};
  var createNewReviewAction = function() {};
  var createNewReservationAction = function() {};
  var getReservationsByDateAction = function() {};
  var viewReviewAction = function() {};
  var deleteReviewAction = function() {};
  var showEditReviewAction = function() {};
  var updateReviewAction = function() {};
  var cancelReservationAction = function() {};


  //functions to set up actions
  function setViewReservationAction(action) {
    viewReservationAction = action;
  }

  function setViewRestaurantReviewsAction(action) {
    viewRestaurantReviewsAction = action;
  }

  function setCreateNewReviewAction(action) {
    createNewReviewAction = action;
  }

  function setCreateNewReservationAction(action) {
    createNewReservationAction = action;
  }

  function setViewReviewAction(action) {
    viewReviewAction = action;
  }

  function setDeleteReviewAction(action) {
    deleteReviewAction = action;
  }

  function setGetReservationsByDateAction(action) {
    getReservationsByDateAction = action;
  }

  function setShowEditReviewAction(action) {
    showEditReviewAction = action;
  }

  function setUpdateReviewAction(action) {
    updateReviewAction = action;
  }

  function setCancelReservationAction(action) {
    cancelReservationAction = action;
  }

  /*this functions add the restaurants to the leaflet map */
  function addRestaurantstoMap(restaurants) {

    /* add marks with clustering approach */
    var markerClusters = L.markerClusterGroup({showCoverageOnHover: true});
    restaurants.forEach(function(currentMark) {
      addRestaurantMark(currentMark, markerClusters);
    });

    map.addLayer(markerClusters);
  }


  //create a restaurant mark and add it to the cluster.
  function addRestaurantMark(currentMark, markerCluster) {

    //add mark to map
    currentMark.mark = L.marker(currentMark.coords);

    var popHTML = generateMarkPopup(currentMark);
    currentMark.mark.bindPopup(popHTML);

    //reference all mark info to be used from leaflet
    currentMark.mark.extraInfo = currentMark;

    markerCluster.addLayer(currentMark.mark);
  }

  //set title for modal window
  function setPopupTitle(title) {
    document.getElementById('popTitle').textContent = title;
  }

  //set content for modal window
  function setPopupContent(contentDiv) {
    //remove previous content
    var content = document.getElementById('popContent');
    content.innerHTML = '';
    content.appendChild(contentDiv);
  }

  //generate a restaurant popup from a restaurant mark.
  function generateMarkPopup(mark) {
    var popHTML = document.createElement('DIV');
    popHTML.className = 'markPopUp';

    var restaurantName = document.createElement('B');
    restaurantName.textContent = mark.name;
    popHTML.appendChild(restaurantName);

    var ratingP = document.createElement('P');
    ratingP.textContent = 'Rating: ' + mark.ratingValue;
    popHTML.appendChild(ratingP);

    var addressP = document.createElement('P');
    addressP.textContent = 'Address: ' + mark.address;
    popHTML.appendChild(addressP);

    var phoneP = document.createElement('P');
    phoneP.textContent = 'Phone: ' + mark.telephone;
    popHTML.appendChild(phoneP);

    var showReviews = document.createElement('A');
    showReviews.textContent = 'Show reviews';
    showReviews.onclick = function() {
      viewRestaurantReviewsAction(mark.name);
    };

    popHTML.appendChild(showReviews);
    popHTML.appendChild(document.createElement('BR'));

    var showReservations = document.createElement('A');
    showReservations.textContent = 'Show reservations';
    showReservations.onclick = function() {
      viewReservationAction(mark.name);
    };

    popHTML.appendChild(showReservations);
    popHTML.appendChild(document.createElement('BR'));


    var createReview = addCreateReviewLink(mark.name);
    if (null != createReview) {
      popHTML.appendChild(createReview);
      popHTML.appendChild(document.createElement('BR'));
    }

    var createReservation = addCreateReservationLink(mark.name);
    if (null != createReservation) {
      popHTML.appendChild(createReservation);
    }

    return popHTML;
  }

  /*show restaurant reviews from an API response */
  /* At this moment, show all reviews without pagination */
  function createReviewsDiv(reviewsResponse) {
    reviewsResponse = JSON.parse(reviewsResponse);


    if (reviewsResponse.length < 1) {
      var error = document.createElement('H2');
      error.textContent = 'No reviews are available';
      return error;
    }

    var reviewList = document.createElement('DIV');
    reviewList.className = 'reviewList';

    for (var j = 0, lim = reviewsResponse.length; j < lim; j++) {
      var reviewElement = document.createElement('DIV');
      reviewElement.className = 'reviewElement';

      //top container
      var top = document.createElement('DIV');
      top.className = 'review-top';

      //rating
      var rating = document.createElement('DIV');
      rating.className = 'rating-div';

      var ratingLabel = document.createElement('SPAN');
      ratingLabel.className = 'ratingLabel';
      ratingLabel.textContent = 'Rating: ';

      var ratingValue = document.createElement('SPAN');
      ratingValue.className = 'ratingValue';
      ratingValue.textContent = reviewsResponse[j].reviewRating.ratingValue;

      rating.appendChild(ratingLabel);
      rating.appendChild(ratingValue);

      top.appendChild(rating);

      //author
      var author = document.createElement('DIV');
      author.className = 'author-div';

      var authorLabel = document.createElement('SPAN');
      authorLabel.className = 'authorLabel';
      authorLabel.textContent = 'Author: ';

      var authorValue = document.createElement('SPAN');
      authorValue.className = 'authorValue';
      authorValue.textContent = reviewsResponse[j].author.name;

      author.appendChild(authorLabel);
      author.appendChild(authorValue);

      top.appendChild(author);

      reviewElement.appendChild(top);

      var hr = document.createElement('HR');
      reviewElement.appendChild(hr);
      //body
      var body = document.createElement('DIV');
      body.className = 'reviewBodyDiv';

      var bodyLabel = document.createElement('SPAN');
      bodyLabel.className = 'bodyLabel';

      var bodyValue = document.createElement('SPAN');
      bodyValue.className = 'bodyValue';
      bodyValue.textContent = reviewsResponse[j].reviewBody;

      body.appendChild(bodyLabel);
      body.appendChild(bodyValue);

      reviewElement.appendChild(body);

      reviewList.appendChild(reviewElement);
    }

    //return reviews div
    return reviewList;
  }

  //create a div that shows the reservations
  function createReservationsDiv(reservationsResponse) {

    reservationsResponse = JSON.parse(reservationsResponse);

    if (reservationsResponse.length < 1) {
      var error = document.createElement('H2');
      error.textContent = 'No reservations are available.';
      document.getElementById('popContent').appendChild(error);
      openPopUpWindow();
      return;
    }

    var reservationsTable = document.createElement('DIV');
    reservationsTable.classList.add('table', 'table-fixed', 'table-hover');

    var tableHead = document.createElement('THEAD');

    var row = document.createElement('TR');
    row.className = 'row';

    var underNameHead = document.createElement('TH');
    underNameHead.className = 'col-xs-6';
    underNameHead.textContent = 'Reserved by:';
    row.appendChild(underNameHead);

    var timeHead = document.createElement('TH');
    timeHead.className = 'col-xs-4';
    timeHead.textContent = 'Reservation time:';
    row.appendChild(timeHead);

    var dinersHead = document.createElement('TH');
    dinersHead.className = 'col-xs-2';
    dinersHead.textContent = 'Diners:';
    row.appendChild(dinersHead);

    tableHead.appendChild(row);
    reservationsTable.appendChild(tableHead);

    var tableBody = document.createElement('TBODY');

    for (var j = 0, lim = reservationsResponse.length; j < lim; j++) {
      row = document.createElement('TR'); //defined previously

      var underName = document.createElement('TD');
      underName.classList.add('col-xs-6');
      underName.textContent = reservationsResponse[j].underName.name;
      row.appendChild(underName);

      var time = document.createElement('TD');
      time.classList.add('col-xs-4');
      time.textContent =
        utils.fixBookingTime(reservationsResponse[j].startTime);
      row.appendChild(time);

      var diners = document.createElement('TD');
      diners.classList.add('col-xs-2');
      diners.textContent = reservationsResponse[j].partySize;
      row.appendChild(diners);

      tableBody.appendChild(row);
    }

    reservationsTable.appendChild(tableBody);
    return reservationsTable;
  }



  function addCreateReviewLink(restaurantName) {
    var userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (! connectionsAPI.hasRole(userInfo,
      connectionsAPI.rol.endUser)) {
      return null;
    }

    var createReviewLink = document.createElement('A');
    createReviewLink.textContent = 'Create review';
    createReviewLink.onclick = (function(restaurantName) {
      return function() {
      createAndShowReviewForm(restaurantName);
      };
    })(restaurantName);

    return createReviewLink;
  }


  function createAndShowReviewForm(restaurantName) {
    var reviewForm = createReviewForm(restaurantName);
    var title = 'Create review for: ' + restaurantName;
    setPopupTitle(title);
    setPopupContent(reviewForm);
    openPopUpWindow();
  }

  //create a form for creating or updating a review
  function createReviewForm(restaurantName, review) {
    var reviewForm = document.createElement('FORM');
    reviewForm.name = 'editReviewForm';
    reviewForm.className = 'editReviewForm';

    reviewForm.onsubmit = function() {
      var ratingValue =
        parseInt(document.forms.editReviewForm.ratingValue.value);

      var reviewBody = document.forms.editReviewForm.reviewBody.value;
      if (review) {
        updateReviewAction(review.name, ratingValue, reviewBody);
      }
      else {
        createNewReviewAction(restaurantName, ratingValue, reviewBody);
      }

      return false;
    };

    var reviewLabel = document.createElement('LABEL');
    reviewLabel.textContent = 'Your review: ';
    reviewForm.appendChild(reviewLabel);
    reviewForm.appendChild(document.createElement('BR'));

    var reviewBody = document.createElement('TEXTAREA');
    reviewBody.name = 'reviewBody';
    reviewForm.appendChild(reviewBody);
    reviewForm.appendChild(document.createElement('BR'));

    var ratingLabel = document.createElement('LABEL');
    ratingLabel.textContent = 'Rating value: ';
    reviewForm.appendChild(ratingLabel);

    var ratingValueSelect = document.createElement('SELECT');
    ratingValueSelect.name = 'ratingValue';

    var option;
    for (var i = 0; i <= maxRating; i++) {
      option = document.createElement('OPTION');
      option.value = i;
      option.textContent = i + ' Star' + (1 != i ? 's' : '');
      ratingValueSelect.appendChild(option);
    }

    reviewForm.appendChild(ratingValueSelect);

    var submit = document.createElement('INPUT');
    submit.type = 'submit';
    submit.value = 'Create Review';
    submit.name = 'submitReview';
    reviewForm.appendChild(submit);


    return reviewForm;
  }

  //inicialize a review form when updating a review
  //instead of create a new one
  function inicializeReviewForm(review) {

    var reviewForm =
      document.forms.namedItem('editReviewForm');

    markSelectedValue(reviewForm.children.ratingValue,
      review.reviewRating.ratingValue);

    reviewForm.children.reviewBody.textContent =
      review.reviewBody;

    reviewForm.children.submitReview.value = 'Update review';
  }



  function addCreateReservationLink(restaurantName) {
    var userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (! connectionsAPI.hasRole(userInfo,
      connectionsAPI.rol.endUser)) {
      return null;
    }

    var createReservationLink = document.createElement('A');
    createReservationLink.textContent = 'Make a reservation';
    createReservationLink.onclick = (function(restaurantName) {
      return function() {
      createAndShowReservationForm(restaurantName);
      };
    })(restaurantName);

    return createReservationLink;
  }


  //make a form to create a reservation and initialize it
  function createAndShowReservationForm(restaurantName) {
    var reservationForm = createReservationForm(restaurantName);
    var title = 'Make reservation for: ' + restaurantName;
    setPopupTitle(title);
    setPopupContent(reservationForm);

    initReservationForm();
    openPopUpWindow();
  }



  function createReservationForm(restaurantName) {

    document.getElementById('popTitle').textContent = 'Reservation for ' +
       restaurantName;

    var reservationForm = document.createElement('FORM');
    reservationForm.name = 'editReservationForm';
    reservationForm.onsubmit = function() {
      //abort if not ready to submit
      if (document.getElementById('submitReservation').disabled) {
        return false;
      }

      //get values
      var partySize =
        document.forms.editReservationForm.partySize.valueAsNumber;
      var reservationDatetime =
        new Date(document.forms.editReservationForm.reservationDate.value);
      var reservationTime =
        new Date($('#reservationTime').timepicker('getTime'));

      reservationDatetime.setHours(reservationTime.getHours(),
                      reservationTime.getMinutes());

      if (!checkReservationInputs()) {
        return false;
      }

      createNewReservationAction(
        restaurantName, partySize, reservationDatetime);
      return false;
    };

    var name = document.createElement('INPUT');
    name.type = 'hidden';
    name.name = 'restaurantName';
    name.id = 'restaurantName';
    name.value = restaurantName;
    reservationForm.appendChild(name);

    var dinersLabel = document.createElement('SPAN');
    dinersLabel.textContent = 'Number of diners';
    reservationForm.appendChild(dinersLabel);

    reservationForm.appendChild(document.createElement('BR'));
    reservationForm.appendChild(document.createElement('BR'));
    var nDiners = document.createElement('INPUT');
    nDiners.name = 'partySize';
    nDiners.id = 'partySize';
    nDiners.type = 'number';
    nDiners.setAttribute('min', '1');
    reservationForm.appendChild(nDiners);

    reservationForm.appendChild(document.createElement('BR'));

    var dateLabel = document.createElement('SPAN');
    dateLabel.textContent = 'Date';
    reservationForm.appendChild(dateLabel);

    reservationForm.appendChild(document.createElement('BR'));

    var reservationDate = document.createElement('INPUT');
    reservationDate.type = 'date';
    reservationDate.id = 'reservationDate';
    reservationDate.disabled = true;
    reservationForm.appendChild(reservationDate);

    reservationForm.appendChild(document.createElement('BR'));

    var timeLabel = document.createElement('SPAN');
    timeLabel.textContent = 'Time:';
    reservationForm.appendChild(timeLabel);

    reservationForm.appendChild(document.createElement('BR'));

    var reservationTime = document.createElement('INPUT');
    reservationTime.type = 'time';
    reservationTime.id = 'reservationTime';
    reservationTime.disabled = true;
    reservationForm.appendChild(reservationTime);

    reservationForm.appendChild(document.createElement('BR'));

    var loadingTime = document.createElement('DIV');
    loadingTime.id = 'loadingTime';
    loadingTime.textContent = 'Calculating availability';
    loadingTime.style.visibility = 'hidden';

    var loadingTimeImg = document.createElement('IMG');
    loadingTimeImg.src = 'img/loading.gif';
    loadingTime.appendChild(loadingTimeImg);

    reservationForm.appendChild(loadingTime);

    var submit = document.createElement('INPUT');
    submit.type = 'submit';
    submit.id = 'submitReservation';
    submit.value = 'Create Reservation';
    submit.disabled = true;
    reservationForm.appendChild(submit);

    return reservationForm;
  }


  function initReservationForm() {
    //init elements
    $('#reservationDate').datepicker({
      dateFormat: 'yy-mm-dd',
      minDate: '-0d',//only allow future reservations
      maxDate: '+90d', // 3 month max
      firstDay: 0,
      beforeShowDay: function(date) {
        return dayAvailableForReservation(date);
      },
      onSelect: initReservationTime //enable select time
    });

    $('#reservationTime').timepicker({
        'timeFormat': 'H:i:s',
        'minTime': minTime.hours + ':' + minTime.minutes,
        'maxTime': maxTime.hours + ':' + maxTime.minutes,
        'disableTimeRanges': [
      ]
    });

    $('#reservationTime').on('changeTime', function() {
      calcAvailability();
    });

    //party_size does not fire initReservatiomTime yet
    alreadyPartySizeInit = false;

    document.getElementById('partySize').addEventListener('change',
                enableCalendar);
  }


  function dayAvailableForReservation(date, restaurantName) {
    if (date < new Date()) {
      return [false, 'pastDate', ''];
    }
      return [true, 'availableReservations', ''];
    }

  function enableCalendar() {
    document.getElementById('reservationDate').disabled = false;
  }


  function initReservationTime() {
    if (alreadyPartySizeInit === false) {
      alreadyPartySizeInit = true;
       enableAvailabilityCalculation();
      document.getElementById('partySize').addEventListener('change',
      initReservationTime);
    }

     document.getElementById('reservationTime').disabled = false;
  }


  function enableAvailabilityCalculation() {

    document.getElementById('partySize').addEventListener('change',
      calcAvailability);
    document.getElementById('reservationDate').addEventListener('change',
      calcAvailability);
    document.getElementById('reservationTime').addEventListener('change',
      calcAvailability);
  }

  function calcAvailability() {
    document.getElementById('submitReservation').disabled = true;
    //show loading
    document.getElementById('loadingTime').style.visibility = '';

    //get values
    var restaurantName =
      document.getElementById('restaurantName').value;
    var reservationDatetime =
        new Date(document.forms.editReservationForm.reservationDate.value);
    var reservationTime =
      $('#reservationTime').timepicker('getTime');

    if (!checkReservationInputs()) {
      return false;
    }

    reservationDatetime.setHours(reservationTime.getHours(),
                      reservationTime.getMinutes());

    getReservationsByDateAction(restaurantName,
        reservationDatetime.toISOString(),
        _proceesAvailabilityResponse,
        _errorProcesingAvailability
      );
    return false;
  }

  function _proceesAvailabilityResponse(restaurantResponse) {
    restaurantResponse = JSON.parse(restaurantResponse);
    if (restaurantResponse.length != 1) {
      console.log('ERROR: NOT RETRIEVED EXACTLY ONE RESTAURANT');
    }

    restaurantResponse = restaurantResponse[0];
    var properties = restaurantResponse.additionalProperty;
    var capacity, occupancyLevel, time;

    for (var i = 0; i < properties.length; i++) {
      if ('capacity' == properties[i].name) {
        capacity = properties[i].value;
      }

      if ('occupancyLevels' == properties[i].name) {
        occupancyLevel = properties[i].value;
        time = properties[i].timestamp;
      }
    }

    var nDiners = document.getElementById('partySize').valueAsNumber;

    var available = (capacity - occupancyLevel - nDiners) >= 0;


    document.getElementById('loadingTime').style.visibility = 'hidden';

    //if available allow to submit
    document.getElementById('submitReservation').disabled =
      ! available;

      if (! available) {
        var errMsg =
          (capacity - occupancyLevel) +
          ' seats available for the specified date and time';
        utils.showMessage(errMsg, 'alert-warning');
      }

  }


  function _errorProcesingAvailability() {
    alert('An error ocurred checking reservation availability');
    document.getElementById('loadingTime').style.visibility = 'hidden';
  }


  function checkReservationInputs() {
    var error = false;
    var reservationDatetime =
        new Date(document.forms.editReservationForm.reservationDate.value);
    var reservationTime =
      $('#reservationTime').timepicker('getTime');


    if (isNaN(reservationDatetime) || (reservationDatetime == null)) {
      document.getElementById('loadingTime').style.visibility = 'hidden';
      document.getElementById('submitReservation').disabled = true;
      document.forms.editReservationForm.reservationDate.classList.add(
        'has-error');
      utils.showMessage('Invalid format for date', 'alert-warning');
      error = true;
    }

    if (isNaN(reservationTime) || (reservationTime == null)) {
      document.getElementById('loadingTime').style.visibility = 'hidden';
      document.getElementById('submitReservation').disabled = true;
      document.getElementById('reservationTime').classList.add('has-error');
      utils.showMessage('Invalid format for time', 'alert-warning');
      error = true;
    }

    if (error) {
      return false;
    }

    document.forms.editReservationForm.reservationDate.classList.remove(
      'has-error');
    document.getElementById('reservationTime').classList.remove('has-error');
    return true;

  }
  //create a table for displaying the reviews
  function createReviewsTable(reviewsResponse) {
    reviewsResponse = JSON.parse(reviewsResponse);

    //clean previous table content
    var myNode = document.getElementById('reviewsTableBody');
    myNode.innerHTML = '';

    if (reviewsResponse.length < 1) {
      var error = document.createElement('TR');
      error.textContent = 'No reviews are available.';
      document.getElementById('reviewsTableBody').appendChild(error);
      return;
    }

    //add entries
    reviewsResponse.forEach(createReviewsTableEntry);
  }

  function createReviewsTableEntry(review) {
    var row = document.createElement('TR');
    var name = document.createElement('TD');
    name.textContent = review.itemReviewed.name;
    name.className = 'col-xs-4';
    row.appendChild(name);

    var rating = document.createElement('TD');
    rating.textContent = review.reviewRating.ratingValue;
    rating.className = 'col-xs-2';
    row.appendChild(rating);

    var view = document.createElement('TD');
    view.className = 'col-xs-2';

    var viewLink = document.createElement('A');
    viewLink.textContent = 'View review';
    viewLink.onclick = createViewReviewLink(review.name);

    view.appendChild(viewLink);
    row.appendChild(view);

    var edit = document.createElement('TD');
    edit.className = 'col-xs-2';

    var editLink = document.createElement('A');
    editLink.textContent = 'Edit review';
    editLink.onclick = createEditReviewLink(review.name);

    edit.appendChild(editLink);
    row.appendChild(edit);

    var del = document.createElement('TD');
    del.className = 'col-xs-2';

    var delLink = document.createElement('A');
    delLink.textContent = 'Delete review';
    delLink.onclick = createDelReviewLink(review.name);

    del.appendChild(delLink);
    row.appendChild(del);

    document.getElementById('reviewsTableBody').appendChild(row);
  }

  //create a table for displaying the organization reviews.
  //This table is different from the returned by createReviewsTable
  //because this does not allow to modify or delete a review.
  function createOrganizationReviewsTable(reviewsResponse) {
    reviewsResponse = JSON.parse(reviewsResponse);
    //clean previous table content
    var myNode = document.getElementById('reviewsTableBody');
    myNode.innerHTML = '';

    if (reviewsResponse.length < 1) {
      var error = document.createElement('TR');
      error.textContent = 'No reviews are available.';
      document.getElementById('reviewsTableBody').appendChild(error);
      return;
    }

    //add entries
    reviewsResponse.forEach(createOrganizationReviewsTableEntry);
  }

  function createOrganizationReviewsTableEntry(review) {
    var row = document.createElement('TR');
    var name = document.createElement('TD');
    name.textContent = review.itemReviewed.name;
    name.className = 'col-xs-6';
    row.appendChild(name);

    var rating = document.createElement('TD');
    rating.textContent = review.reviewRating.ratingValue;
    rating.className = 'col-xs-3';
    row.appendChild(rating);

    var view = document.createElement('TD');
    view.className = 'col-xs-3';


    var viewLink = document.createElement('A');
    viewLink.textContent = 'View review';
    viewLink.onclick = createViewReviewLink(review.name);

    view.appendChild(viewLink);
    row.appendChild(view);

    document.getElementById('reviewsTableBody').appendChild(row);
  }


  function createViewReviewLink(reviewId) {
    return function() {
      viewReviewAction(reviewId);
    };
  }

  function createEditReviewLink(reviewId) {
    return function() {
      showEditReviewAction(reviewId);
    };
  }

  function createDelReviewLink(reviewId) {
    return function() {
      if (!(window.confirm('Delete review?'))) {
        return;
      }
      deleteReviewAction(reviewId);
    };
  }

  function createCancelReservationLink(reservationId) {
    return function() {
      if (!(window.confirm('Cancel reservation?'))) {
        return;
      }
      cancelReservationAction(reservationId);
    };
  }

  //return a div with the review information
  function createViewReviewDiv(reviewResponse) {
    reviewResponse = JSON.parse(reviewResponse);
    if (reviewResponse.length != 1) {
      window.alert('Error: more than one review received.');
    }

    var review = reviewResponse[0];

    var reviewElement = document.createElement('DIV');
    reviewElement.className = 'reviewElement';

    //top container
    var top = document.createElement('DIV');
    top.class = 'review-top';

    //rating
    var rating = document.createElement('DIV');
    rating.class = 'rating-div';

    var ratingLabel = document.createElement('SPAN');
    ratingLabel.className = 'ratingLabel';
    ratingLabel.textContent = 'Rating: ';

    var ratingValue = document.createElement('SPAN');
    ratingValue.className = 'ratingValue';
    ratingValue.textContent = review.reviewRating.ratingValue;

    rating.appendChild(ratingLabel);
    rating.appendChild(ratingValue);
    top.appendChild(rating);

    //author
    var author = document.createElement('DIV');
    author.class = 'author-div';

    var authorLabel = document.createElement('SPAN');
    authorLabel.className = 'authorLabel';
    authorLabel.textContent = 'Author: ';

    var authorValue = document.createElement('SPAN');
    authorValue.className = 'authorValue';
    authorValue.textContent = review.author.name;

    author.appendChild(authorLabel);
    author.appendChild(authorValue);
    top.appendChild(author);

    reviewElement.appendChild(top);

    var hr = document.createElement('HR');
    reviewElement.appendChild(hr);
    //body
    var body = document.createElement('DIV');
    body.class = 'reviewBodyDiv';

    var bodyLabel = document.createElement('SPAN');
    bodyLabel.className = 'bodyLabel';

    var bodyValue = document.createElement('SPAN');
    bodyValue.className = 'bodyValue';
    bodyValue.textContent = review.reviewBody;

    body.appendChild(bodyLabel);
    body.appendChild(bodyValue);
    reviewElement.appendChild(body);

    return reviewElement;
  }


  function markSelectedValue(selectObject, value) {
    for (var i = 0; i < selectObject.options.length; i++) {
      if (String(selectObject.options[i].value) == String(value)) {
        selectObject.options[i].selected = true;
      }
      else {
        selectObject.options[i].selected = false;
      }
    }
  }

  //create a table for displaying reservations
  function createReservationsTable(reservationsResponse) {
    reservationsResponse = JSON.parse(reservationsResponse);

    //clean previous table content
    var myNode = document.getElementById('reservationsTableBody');
    myNode.innerHTML = '';


    if (reservationsResponse.length < 1) {
      var error = document.createElement('TR');
      error.textContent = 'No reservations are available';
      document.getElementById('reservationsTableBody').appendChild(error);
      return;
    }

    //add entries
    reservationsResponse.forEach(createReservationsTableEntry);
  }

  function createReservationsTableEntry(reservation) {
    var row = document.createElement('TR');

    var name = document.createElement('TD');
    name.textContent = reservation.reservationFor.name;
    row.appendChild(name);

    var time = document.createElement('TD');
    time.textContent = utils.fixBookingTime(reservation.startTime);
    row.appendChild(time);

    var diners = document.createElement('TD');
    diners.textContent = reservation.partySize;
    row.appendChild(diners);

    var cancel = document.createElement('TD');

    var cancelLink = document.createElement('A');
    cancelLink.textContent = 'Cancel reservation';
    cancelLink.onclick =
      createCancelReservationLink(reservation.reservationId);
    cancel.appendChild(cancelLink);
    row.appendChild(cancel);

    document.getElementById('reservationsTableBody').appendChild(row);
  }



  /* aux function that opens the PopUp windows */
  function openPopUpWindow() {
    $('#popWindow').modal('show');
  }

  /*aux function that closes the PopUp window */
  function closePopUpWindow() {
    $('#popWindow').modal('hide');
  }

  return {
    addRestaurantstoMap: addRestaurantstoMap,
    setPopupTitle: setPopupTitle,
    setPopupContent: setPopupContent,
    createReviewsDiv: createReviewsDiv,
    createReservationsDiv: createReservationsDiv,
    createReviewsTable: createReviewsTable,
    createOrganizationReviewsTable: createOrganizationReviewsTable,
    createReservationsTable: createReservationsTable,
    createReviewForm: createReviewForm,
    createViewReviewDiv: createViewReviewDiv,
    setViewReservationAction: setViewReservationAction,
    setViewRestaurantReviewsAction: setViewRestaurantReviewsAction,
    setCreateNewReviewAction: setCreateNewReviewAction,
    setCreateNewReservationAction: setCreateNewReservationAction,
    setGetReservationsByDateAction: setGetReservationsByDateAction,
    setViewReviewAction: setViewReviewAction,
    setShowEditReviewAction: setShowEditReviewAction,
    setUpdateReviewAction: setUpdateReviewAction,
    setCancelReservationAction: setCancelReservationAction,
    setDeleteReviewAction: setDeleteReviewAction,
    inicializeReviewForm: inicializeReviewForm,
    openPopUpWindow: openPopUpWindow,
    closePopUpWindow: closePopUpWindow
  };
})();



if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = drawModule;
    connectionsAPI = require('./connectionsAPI.js');
    utils = require('./utils.js');
    GLOBAL.localStorage = require('localStorage');
  }
}
