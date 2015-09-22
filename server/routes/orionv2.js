/*
 * Orion-V2 REST API
 */

var auth_request = require('../auth_request');
var utils = require('../utils');

// Restaurants

exports.create_restaurant = function (req, res) {
    auth_request("v2/entities", "POST", req.body , function(data){ res.send(utils.dataToSchema(data)) });
};
exports.read_restaurant = function (req, res) {
    auth_request("v2/entities/"+req.params.id, "GET", { "type":"Restaurant" } , function(data){ res.send(utils.dataToSchema(data)) });
};
exports.update_restaurant = function (req, res) {
    auth_request("v2/entities/"+req.params.id, "PATCH", req.body , function(data){ res.send(utils.dataToSchema(data)) });
};
exports.delete_restaurant = function (req, res) {
    auth_request("v2/entities/"+req.params.id, "DELETE", {} , function(data){ res.send(utils.dataToSchema(data)) });
};
exports.get_restaurants = function(req, res) {
    auth_request("v2/entities", "GET", { "type":"Restaurant", "limit":"1000" } , function(data){ res.send(utils.dataToSchema(data)) });
};

// Reviews

exports.create_review = function (req, res) {
    auth_request("v2/entities", "POST", req.body , function(data){ res.send(utils.dataToSchema(data)) });
};
exports.read_review = function (req, res) {
    auth_request("v2/entities/"+req.params.id, "GET", { "type":"Review" } , function(data){ res.send(utils.dataToSchema(data)) });
};
exports.update_review = function (req, res) {
    auth_request("v2/entities/"+req.params.id, "PATCH", req.body , function(data){ res.send(utils.dataToSchema(data)) });
};
exports.delete_review = function (req, res) {
    auth_request("v2/entities/"+req.params.id, "DELETE", {} , function(data){ res.send(utils.dataToSchema(data)) });
};
exports.get_reviews = function(req, res) {
    auth_request("v2/entities", "GET", { "type":"Review", "limit":"1000" } , function(data){ res.send(utils.dataToSchema(data)) });
};

// Reservations

exports.create_reservation = function (req, res) {
    auth_request("v2/entities", "POST", req.body , function(data){ res.send(utils.dataToSchema(data)) });
};
exports.read_reservation = function (req, res) {
    auth_request("v2/entities/"+req.params.id, "GET", { "type":"FoodEstablishmentReservation" } , function(data){ res.send(utils.dataToSchema(data)) });
};
// update_reservation function replaces ALL of the elements
exports.update_reservation = function (req, res) {
    auth_request("v2/entities/"+req.params.id, "PATCH", req.body , function(data){ res.send(utils.dataToSchema(data)) });
};
exports.delete_reservation = function (req, res) {
    auth_request("v2/entities/"+req.params.id, "DELETE", {} , function(data){ res.send(utils.dataToSchema(data)) });
};
exports.get_reservations = function(req, res) {
    auth_request("v2/entities", "GET", { "type":"FoodEstablishmentReservation", "limit":"1000" } , function(data){ res.send(utils.dataToSchema(data)) });
};

// User data
// To be fixed
exports.get_user_reviews = function (req, res) {
    auth_request("v2/entities", "GET", {"type":"Review", "author": {"type": "Person","value": [{"name": "name","value": req.params.id}]}},
                 function(data){ res.send(utils.dataToSchema(data))});
};
//To be fixed
exports.get_user_reservations = function (req, res) {
    auth_request("v2/entities", "GET", {"type":"FoodEstablishmentReservation", "underName":{"type": "Person","value": [{"name": "name","value": req.params.id}]}},
                 function(data){ res.send(utils.dataToSchema(data))});
};