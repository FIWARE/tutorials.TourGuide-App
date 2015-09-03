/*
 * ChanChan Orion REST API
 */

var utils = require('../utils');
var config = require('../config');
var orion_url = config.orion_hostname; // To be changed to PEP for auth
var orion_port = config.orion_port;
var orion_pep_enabled = config.orion_pep_enabled;

/* Get entities from orion */
function get_orion_entities(type, restaurant_name_regexp, req, res) {
    return_post = function(res, buffer, headers) {
        res.setHeader('Content-Type', 'application/json');
        res.send(unescape(buffer));
    };

    var name = restaurant_name_regexp;
    var orion_res_limit = 1000; // Max orion items to avoid pagination

    post_data = {
          "entities": [
           {
               "type": type,
               "isPattern": "true",
               "id": ".*"+name+".*"
           }]
    };

    // In geoqueries we get: lat=<lat>&long=<long>&radius=<radius>

    if (req.query.lat !== undefined && req.query.long !== undefined &&
        req.query.radius !== undefined) {

        console.log("GEO query");

        post_data ["restriction"] = {
            "scopes": [
               {
                 "type" : "FIWARE::Location",
                 "value" : {
                   "circle": {
                     "centerLatitude": req.query.lat,
                     "centerLongitude": req.query.long,
                     "radius": req.query.radius
                   }
                 }
               }
           ]
        }
    }

    if (name === undefined) {
        // Get all restaurants
        post_data.entities[0].id=".*";
    }

    post_data = JSON.stringify(post_data);

    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(post_data),
        'X-Auth-Token':req.session.access_token
    };

    var orion_path = '/NGSI10/queryContext?limit='+orion_res_limit;
    var pep_extra_path = 'entity_type='+type;  // For auth purposes

    var options = {
        host: orion_url,
        port: orion_port,
        path: orion_path + ((orion_pep_enabled) ? '&' + pep_extra_path : '' ),
        method: 'POST',
        headers: headers
    };

    utils.do_post(options, post_data, return_post, res);
}

/* Update entities in orion */
exports.update_entities = function(req, res) {
  return_post = function(res, buffer, headers) {
      res.send(buffer);
  };

  var org_id = req.params.org_id;
  var post_data = JSON.stringify(req.body);

  headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(post_data)
  };

  var options = {
      host: orion_url,
      port: orion_port,
      path: '/NGSI10/updateContext',
      method: 'POST',
      headers: headers
  };

  utils.do_post(options, post_data, return_post, res);
};


// Restaurants

exports.create_restaurant = function (req, res) {
    res.send("exports.create_restaurant");
};
exports.read_restaurant = function (req, res) {
    res.send("exports.read_restaurant");
};
exports.update_restaurant = function (req, res) {
    res.send("exports.update_restaurant");
};
exports.delete_restaurant = function (req, res) {
    res.send("exports.delete_restaurant");
};
exports.get_restaurants = function(req, res) {
    get_orion_entities("restaurant", req.params.name, req, res);
};

// Reviews

exports.create_review = function (req, res) {
    res.send("exports.create_review");
};
exports.read_review = function (req, res) {
    res.send("exports.read_review");
};
exports.update_review = function (req, res) {
    res.send("exports.update_review");
};
exports.delete_review = function (req, res) {
    res.send("exports.delete_review");
};
exports.get_reviews = function(req, res) {
    get_orion_entities("review", req.params.name, req, res);
};

// Reservations

exports.create_reservation = function (req, res) {
    res.send("exports.create_reservation");
};
exports.read_reservation = function (req, res) {
    res.send("exports.read_reservation");
};
exports.update_reservation = function (req, res) {
    res.send("exports.update_reservation");
};
exports.delete_reservation = function (req, res) {
    res.send("exports.delete_reservation");
};
exports.get_reservations = function(req, res) {
    get_orion_entities("reservation", req.params.name, req, res);
};

// User data

exports.get_user_reviews = function (req, res) {
    res.send("exports.create_reservation");
};
exports.get_user_reservations = function (req, res) {
    res.send("exports.create_reservation");
};

