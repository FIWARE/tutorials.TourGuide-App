/*
 * ChanChan Orion REST API
 */

var utils = require('../utils');
var config = require('../config');
var orion_url = config.orion_hostname; // To be changed to PEP for auth
var orion_port = config.orion_port;
var orion_pep_enabled = config.orion_pep_enabled;

/* Get entities from orion */
function get_entities(type, restaurant_name_regexp, req, res, pattern) {
    return_post = function(res, buffer, headers) {
        res.setHeader('Content-Type', 'application/json');
        res.send(unescape(buffer));
    };

    var name = restaurant_name_regexp;
    var orion_res_limit = 1000; // Max orion items to avoid pagination

    if (pattern === undefined) {
        pattern = "true";
    }

    if (pattern === "true") {
        if (name === undefined) {
            // Get all entities
            name =".*";
        } else {
            name = ".*"+name+".*";
        }
    }

    post_data = {
          "entities": [
           {
               "type": type,
               "isPattern": pattern,
               "id": name
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

/* Update an entity in orion */
exports.update_entity = update_entity;

function update_entity(req, res) {
  return_post = function(res, buffer, headers) {
      res.send(buffer);
  };

  var post_data = JSON.stringify(req.body);

  headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(post_data),
      'X-Auth-Token':req.session.access_token
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

/* Delete an entity in orion */

function delete_entity(type, req, res) {
    var return_post = function(res, buffer, headers) {
        res.setHeader('Content-Type', 'application/json');
        res.send(unescape(buffer));
    };

    var id = req.params.id;

    var post_data = {
          "contextElements": [
           {
               "type": type,
               "isPattern": "false",
               "id": id
           }],
           "updateAction": "DELETE"
    };

    post_data = JSON.stringify(post_data);

    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(post_data),
        'X-Auth-Token':req.session.access_token
    };

    var options = {
        host: orion_url,
        port: orion_port,
        path: '/NGSI10/updateContext',
        method: 'POST',
        headers: headers
    };

    utils.do_post(options, post_data, return_post, res);
}

// Restaurants

exports.create_restaurant = function (req, res) {
    update_entity(req, res);
};
exports.read_restaurant = function (req, res) {
    get_entities("restaurant", req.params.id, req, res, "false");
};
exports.update_restaurant = function (req, res) {
    update_entity(req, res);
};
exports.delete_restaurant = function (req, res) {
    delete_entity("restautant", req, res);
};
exports.get_restaurants = function(req, res) {
    get_entities("restaurant", req.params.name, req, res);
};

// Reviews

exports.create_review = function (req, res) {
    update_entity(req, res);
};
exports.read_review = function (req, res) {
    get_entities("review", req.params.id, req, res, "false");
    res.send("exports.read_review");
};
exports.update_review = function (req, res) {
    update_entity(req, res);
};
exports.delete_review = function (req, res) {
    delete_entity("review", req, res);
};
exports.get_reviews = function(req, res) {
    get_entities("review", req.params.name, req, res);
};

// Reservations

exports.create_reservation = function (req, res) {
    update_entity(req, res);
};
exports.read_reservation = function (req, res) {
    get_entities("reservation", req.params.id, req, res, "false");
};
exports.update_reservation = function (req, res) {
    update_entity(req, res);
};
exports.delete_reservation = function (req, res) {
    delete_entity("reservation", req, res);
};
exports.get_reservations = function(req, res) {
    get_entities("reservation", req.params.name, req, res);
};

// User data

exports.get_user_reviews = function (req, res) {
    res.send("exports.create_reservation");
};
exports.get_user_reservations = function (req, res) {
    res.send("exports.create_reservation");
};

