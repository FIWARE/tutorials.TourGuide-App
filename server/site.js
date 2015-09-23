'use strict';

var auth = require('./auth');

exports.index = function(req, res){
    // check if user is authenticated
    if (!req.session.access_token) {
        // user is not authenticated
        res.send('<a href=\'/auth\'>Log in with your FI-WARE Account</a>');
    } else {
        // user is already authenticated
        auth.getUserData(req, res, function(userData){
            console.log('User_data: ', userData);
        });

        auth.getUserData(req, res, function(user){
            console.log('user:', user.email);
            var resHtml = 'Welcome '+user.id+'!';
            //var token = '?token='+req.session.access_token;
            resHtml += '<br><ul>';
            resHtml += '<li><a href=\'/api/orionv2/restaurants/\'>All Restaurants</a></li>';
            resHtml += '<li><a href=\'/api/orionv2/reviews/\'>All Reviews</a> (manager)</li>';
            resHtml += '<li><a href=\'/api/orionv2/reservations/\'>All Reservations</a> (manager)</li>';
            resHtml += '</ul><br>';
            resHtml += '<br><a href=\'/logout\'>Log out</a>';
            res.send(resHtml);
        });
    }
};
