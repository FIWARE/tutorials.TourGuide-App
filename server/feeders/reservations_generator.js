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

var utils = require('../utils');
var fs = require('fs');
var async = require('async');
var shortid = require('shortid'); // unique ids generator
var auth_request = require('../auth_request');

var api_rest_host = "compose_devguide_1";
var api_rest_port = 80;
var api_rest_simtasks = 2 // number of simultaneous calls to API REST
var reservations_added = 0;
var restaurants_data; // All data for the restaurants to be reserved

var feed_orion_reservations = function() {
    return_post = function(res, buffer, headers) {
        reservations_added++;
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
        var attributes = task.attributes;

        auth_request("v2/entities", "POST", attributes , callback);
    }, api_rest_simtasks);


    q.drain = function() {
        console.log("Total reservations added: " + reservations_added);
    }

    Object.keys(restaurants_data).forEach(function(element, pos, _array) {
        // Call orion to append the entity
        var rname = restaurants_data[pos].id;
        rname += "-"+shortid.generate();

        //var address = restaurants_data[pos].contextElement.attributes[0];
        //address.value[0].value = utils.fixedEncodeURIComponent(address.value[0].value);

        var reservations = ["Cancelled","Confirmed","Hold","Pending"];

        var attr = {"@context": "http://schema.org", 
                    "type": "FoodEstablishmentReservation", 
                    "id":encodeURIComponent(rname),
                    "reservationStatus":utils.randomElement(reservations), 
                    "underName": {},
                    "reservationFor": {},
                    "startTime": utils.getRandomDate(),
                    "partySize": utils.randomIntInc(1,20)};

        // Time to add first attribute to orion as first approach
        attr.underName["@type"] = "Person";
        attr.underName["name"] = "user"+utils.randomIntInc(1,10);

        attr.reservationFor["@type"] = "FoodEstablishment";
        attr.reservationFor["name"] = restaurants_data[pos].id;
        attr.reservationFor["address"] = restaurants_data[pos].address;

        q.push({"rname":rname, "attributes":attr}, return_post);
    });
};

// Load restaurant data from Orion
var load_restaurant_data = function() {

    var process_restaurants = function (data) {
        restaurants_data = JSON.parse(JSON.stringify(data));
        // Once we have all data for restaurants generate reviews for them
        feed_orion_reservations();
    };

    auth_request("v2/entities", "GET", { "type":"Restaurant", "limit":"1000" } , process_restaurants);
};

console.log("Generating random reservations for restaurants ...");

load_restaurant_data();
