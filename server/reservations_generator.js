/*
 * reservations_generator.js
 * Copyright(c) 2015 Bitergia
 * Author: Alvaro del Castillo <acs@bitergia.com>
 * MIT Licensed

  Generates random reservations for restaurants in orion

  First it gets all restaurant information
  Then a random automatic reservation is generated 
  Then the reservation is added to Orion CB

*/


var utils = require('./utils');
var fs = require('fs');
var async = require('async');
var shortid = require('shortid'); // unique ids generator

var api_rest_host = "compose_devguide_1";
var api_rest_port = 80;
var api_rest_simtasks = 5 // number of simultaneous calls to API REST
var reservations_added = 0;
var restaurants_data; // All data for the restaurants to be reserved


var feed_orion_reservations = function() {
    return_post = function(res, buffer, headers) {
        reservations_added++;
        // console.log(buffer);
        console.log(reservations_added+"/"+restaurants_data.length);
    };

    // restaurants_data = restaurants_data.slice(0,5); // debug with few items

    console.log("Feeding reservations info in orion.");
    console.log("Number of restaurants: " + restaurants_data.length);

    var api_rest_path = "/api/orion/entities/";
    var org_name = "devguide";

    // Limit the number of calls to be done in parallel to orion
    var q = async.queue(function (task, callback) {
        var rname = task.rname;
        console.log("Adding reservation to " + rname);
        var attributes = task.attributes;
        api_rest_path += org_name;

        // Time to build the Context Element in Orion language
        var post_data = {
            "contextElements": [
                    {
                        "type": "reservation",
                        "isPattern": "false",
                        "id": rname,
                        "attributes": attributes
                    }
            ],
            "updateAction": "APPEND"
        };

        // POST to create a new entity
        post_data = JSON.stringify(post_data);

        var headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Content-Length': Buffer.byteLength(post_data)
        };

        var options = {
                host: api_rest_host,
                port: api_rest_port,
                path: api_rest_path,
                method: 'POST',
                headers: headers
            };
        utils.do_post(options, post_data, callback);
    }, api_rest_simtasks);


    q.drain = function() {
        console.log("Total reservations added: " + reservations_added);
    }

    Object.keys(restaurants_data).forEach(function(element, pos, _array) {
        // Call orion to append the entity
        var rname = restaurants_data[pos].contextElement.id;
        rname += "-"+shortid.generate();
        // Time to add first attribute to orion as first approach
        var attributes = [];
        var attr = {"name":"bookingTime",
                    "type":"datetime",
                    "value":new Date().toJSON()};
        attributes.push(attr)
        attr = {"name":"reservationFor",
                "type":"Restaurant",
                "value":rname};
        attributes.push(attr)
        attr = {"name":"underName",
                "type":"Person",
                "value":"Customer A"};
        attributes.push(attr)
        q.push({"rname":rname, "attributes":attributes}, return_post);
    });
};

// Load restaurant data from Orion
var load_restaurant_data = function() {

    var process_restaurants = function (res, data) {
        restaurants_data = JSON.parse(data).contextResponses;
        // Once we have all data for restaurants generate reservations for them
        feed_orion_reservations();
    };

    // http://compose_devguide_1/api/orion/restaurants/
    var url_path = "/api/orion/restaurants/";

    var headers = {
            'Accept': 'application/json',
    };

    var options = {
        host: api_rest_host,
        path: url_path,
        method: 'GET',
        headers: headers
    };

    utils.do_get(options, process_restaurants);
};

console.log("Generating random reservations for restaurants ...");

load_restaurant_data();