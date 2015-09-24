/*jshint node:true */
'use strict';

var auth = require('./auth');

exports.index = function (req, res) {
  /*jshint camelcase: false */
  // check if user is authenticated
  if (!req.session.access_token) {
    // user is not authenticated
    res.send(
      '<a href=\'/auth\'>Log in with your FI-WARE Account</a>');
  } else {
    // user is already authenticated
    auth.getUserData(req, res, function (userData) {
      console.log('User_data: ', userData);
    });
    auth.getUserData(req, res, function (user) {
      console.log('user:', user.email);
      var resHtml = 'Welcome ' + user.id + '!';
      resHtml += '<br><ul>';
      resHtml +=
        '<li><a href=\'/api/orionv2/restaurants/\'>Restaurants</a></li>';
      resHtml +=
        '<li><a href=\'/api/orionv2/reviews/\'>Reviews</a></li>';
      resHtml +=
        '<li><a href=\'/api/orionv2/reservations/\'>Reservations</a></li>';
      resHtml += '</ul><br>';
      resHtml += '<br><a href=\'/logout\'>Log out</a>';
      res.send(resHtml);
    });
  }
};