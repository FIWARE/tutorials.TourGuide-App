/*jshint node:true */
'use strict';
var express = require('express');
var auth = require('./auth');
var site = require('./site');
var orion = require('./routes/orion');
var orionv2 = require('./routes/orionv2');

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

app.post('/api/orion/restaurant', orion.create_restaurant);
app.get('/api/orion/restaurant/:id', orion.read_restaurant);
app.put('/api/orion/restaurant/:id', orion.update_restaurant);
app.delete('/api/orion/restaurant/:id', orion.delete_restaurant);
app.get('/api/orion/restaurants', orion.get_restaurants);
app.get('/api/orion/restaurants/:name', orion.get_restaurants);

app.post('/api/orion/reservation', orion.create_reservation);
app.get('/api/orion/reservation/:id', orion.read_reservation);
app.put('/api/orion/reservation/:id', orion.update_reservation);
app.delete('/api/orion/reservation/:id', orion.delete_reservation);
app.get('/api/orion/reservations', orion.get_reservations);
app.get('/api/orion/reservations/:name', orion.get_reservations);

app.post('/api/orion/review', orion.create_review);
app.get('/api/orion/review/:id', orion.read_review);
app.put('/api/orion/review/:id', orion.update_review);
app.delete('/api/orion/review/:id', orion.delete_review);
app.get('/api/orion/reviews', orion.get_reviews);
app.get('/api/orion/reviews/:name', orion.get_reviews);

app.post('/api/orion/entities/:org_id', orion.update_entity);

// User API
app.get('/api/orion/user/:id/reviews', orion.get_user_reviews);
app.get('/api/orion/user/:id/reservations', orion.get_user_reservations);

// Temperatures
app.post('/api/orion/temperature', orion.receive_temperature);
app.post('/api/orion/restaurant/:id/temperature', orion.set_restaurant_temperature);

// Orion V2

// Restaurants, reservations and reviews: CRUD, listing and searches

app.post('/api/orionv2/restaurant', orionv2.createRestaurant);
app.get('/api/orionv2/restaurant/:id', orionv2.readRestaurant);
app.put('/api/orionv2/restaurant/:id', orionv2.updateRestaurant);
app.delete('/api/orionv2/restaurant/:id', orionv2.deleteRestaurant);
app.get('/api/orionv2/restaurants', orionv2.getRestaurants);

app.post('/api/orionv2/review', orionv2.createReview);
app.get('/api/orionv2/review/:id', orionv2.readReview);
app.put('/api/orionv2/review/:id', orionv2.updateReview);
app.delete('/api/orionv2/review/:id', orionv2.deleteReview);
app.get('/api/orionv2/reviews', orionv2.getReviews);

app.post('/api/orionv2/reservation', orionv2.createReservation);
app.get('/api/orionv2/reservation/:id', orionv2.readReservation);
app.put('/api/orionv2/reservation/:id', orionv2.updateReservation);
app.delete('/api/orionv2/reservation/:id', orionv2.deleteReservation);
app.get('/api/orionv2/reservations', orionv2.getReservations);

// User API v2
app.get('/api/orionv2/user/:id/reviews', orionv2.getUserReviews);
app.get('/api/orionv2/user/:id/reservations', orionv2.getUserReservations);


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