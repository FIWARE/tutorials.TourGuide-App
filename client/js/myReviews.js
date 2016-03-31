'use strict';
/*
 * myReviews.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors:
 *   Jaisiel Santana <jaisiel@gmail.com>
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

*/
//initialization
var initReviews = function() {
  //only gets reviews if the user is logged
  connectionsAPI.loginNeeded(function() {
    var userInfo = JSON.parse(localStorage.getItem('userInfo'));
    restaurantsAPI.getUserReviews(userInfo.displayName);
  });


  //todo translate to common js
  $('tbody').height($(window).height() - $('thead th').height() -
    $('#loggedDiv').height() - 50);
};

utils.addLoadEvent(initReviews);
