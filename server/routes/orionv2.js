/*
 * Orion-V2 REST API
 */

var auth_request = require('../auth_request')

// Restaurants

exports.create_restaurant = function (req, res) {
    auth_request("v2/entities", "POST", req.body , function(data){ res.send(JSON.stringify(data)) });
};
exports.read_restaurant = function (req, res) {
    auth_request("v2/entities", "GET", { "id":req.params.id, "type":"restaurant" } , function(data){ res.send(JSON.stringify(data)) });
};
// Update_restaurant function replaces ALL of the elements
exports.update_restaurant = function (req, res) {
    auth_request("v2/entities/"+req.params.id, "PUT", req.body , function(data){ res.send(JSON.stringify(data)) });
};
exports.delete_restaurant = function (req, res) {
    auth_request("v2/entities/"+req.params.id, "DELETE", {} , function(data){ res.send(JSON.stringify(data)) });
};
exports.get_restaurants = function(req, res) {
    auth_request("v2/entities", "GET", { "type":"restaurant" } , function(data){ res.send(JSON.stringify(data)) });
};

// Reviews

exports.create_review = function (req, res) {
    auth_request("v2/entities", "POST", req.body , function(data){ res.send(JSON.stringify(data)) });
};
exports.read_review = function (req, res) {
    auth_request("v2/entities", "GET", { "id":req.params.id, "type":"review" } , function(data){ res.send(JSON.stringify(data)) });
};
// update_review function replaces ALL of the elements
exports.update_review = function (req, res) {
    auth_request("v2/entities/"+req.params.id, "PUT", req.body , function(data){ res.send(JSON.stringify(data)) });
};
exports.delete_review = function (req, res) {
    auth_request("v2/entities/"+req.params.id, "DELETE", {} , function(data){ res.send(JSON.stringify(data)) });
};
exports.get_reviews = function(req, res) {
    auth_request("v2/entities", "GET", { "type":"review" } , function(data){ res.send(JSON.stringify(data)) });
};

// Reservations

exports.create_reservation = function (req, res) {
    auth_request("v2/entities", "POST", req.body , function(data){ res.send(JSON.stringify(data)) });
};
exports.read_reservation = function (req, res) {
    auth_request("v2/entities", "GET", { "id":req.params.id, "type":"reservation" } , function(data){ res.send(JSON.stringify(data)) });
};
// update_reservation function replaces ALL of the elements
exports.update_reservation = function (req, res) {
    auth_request("v2/entities/"+req.params.id, "PUT", req.body , function(data){ res.send(JSON.stringify(data)) });
};
exports.delete_reservation = function (req, res) {
    auth_request("v2/entities/"+req.params.id, "DELETE", {} , function(data){ res.send(JSON.stringify(data)) });
};
exports.get_reservations = function(req, res) {
    auth_request("v2/entities", "GET", { "type":"reservation" } , function(data){ res.send(JSON.stringify(data)) });
};

// User data
// To be fixed
exports.get_user_reviews = function (req, res) {
    auth_request("v2/entities", "GET", {"type":"review", "author": {"type": "Person","value": [{"name": "name","value": req.params.id}]}},
                 function(data){ res.send(JSON.stringify(data))});
};
//To be fixed
exports.get_user_reservations = function (req, res) {
    auth_request("v2/entities", "GET", {"type":"reservation", "underName":{"type": "Person","value": [{"name": "name","value": req.params.id}]}},
                 function(data){ res.send(JSON.stringify(data))});
};