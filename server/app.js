/*jshint node:true */
'use strict';
var express = require('express');
var auth = require('./auth');
var site = require('./site');
var orion = require('./routes/orion');

var app = express();

app.use(express.logger());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({
  secret: '08bf59703922c49573f008b4ce58b5b0'
}));
app.configure(function () {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
  app.use(express.static(__dirname + '/public'));
});

// devguide app
app.use('/client', express.static(__dirname + '/client'));

// main page
app.get('/', site.index);
//app.get('/', function(req, res) {
//    res.redirect('/client');
//});

// Auth support
app.get('/login', auth.login);
app.get('/auth', auth.auth);
app.get('/get_user_data', auth.getUserData);
app.get('/get_username', auth.getUsername);
app.get('/logout', auth.logout);

// API REST definition

// Restaurants, reservations and reviews: CRUD, listing and searches

app.post('/api/orion/restaurant', orion.createRestaurant);
app.get('/api/orion/restaurant/:id', orion.readRestaurant);
app.patch('/api/orion/restaurant/:id', orion.updateRestaurant);
app.delete('/api/orion/restaurant/:id', orion.deleteRestaurant);
app.get('/api/orion/restaurants', orion.getRestaurants);
app.get('/api/orion/restaurants/organization/:org',
  orion.getOrganizationRestaurants);

app.post('/api/orion/review', orion.createReview);
app.get('/api/orion/review/:id', orion.readReview);
app.patch('/api/orion/review/:id', orion.updateReview);
app.delete('/api/orion/review/:id', orion.deleteReview);
app.get('/api/orion/reviews', orion.getReviews);
app.get('/api/orion/reviews/user/:user', orion.getUserReviews);
app.get('/api/orion/reviews/restaurant/:restaurant',
  orion.getRestaurantReviews);
app.get('/api/orion/reviews/organization/:org',
  orion.getOrganizationReviews);


app.post('/api/orion/reservation', orion.createReservation);
app.get('/api/orion/reservation/:id', orion.readReservation);
app.patch('/api/orion/reservation/:id', orion.updateReservation);
app.delete('/api/orion/reservation/:id', orion.deleteReservation);
app.get('/api/orion/reservations', orion.getReservations);

// Sensors

app.post('/api/orion/sensors', orion.updateSensors);

// END API REST

app.get('*', function (req, res, next) {
  var err = new Error();
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  if (err.status !== 404) {
    return next();
  }

  res.status(404);
  res.send(err.message || 'ups!');
});

// start server
app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
