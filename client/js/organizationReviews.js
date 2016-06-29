'use strict';
/*
 * organizationReviews.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors:
 *   Jaisiel Santana <jaisiel@gmail.com>
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

*/
var connectionsAPI;
var utils;
var clientLogic;
//initialization
var initReviews = function() {

  clientLogic.setUpDrawModule();
  //get franchise from url
  var franchise = window.location.search.replace('?', '');
  var prefix = 'organization=';
  if (franchise.slice(0, prefix.length) == prefix) {

    //only gets reviews if the user is logged
    connectionsAPI.loginNeeded(function() {
      clientLogic.showReviewsByOrganization(
        franchise.slice(prefix.length));
    });

  }


  $('tbody').height($(window).height() - $('thead th').height() -
    $('#loggedDiv').height() - 50);
};

utils.addLoadEvent(initReviews);
