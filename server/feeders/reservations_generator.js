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

var apiRestSimtasks = 2 // number of simultaneous calls to API REST
var reservationsAdded = 0;
var restaurantsData; // All data for the restaurants to be reserved

var feedOrionReservations = function() {
    returnPost = function(res, buffer, headers) {
        reservationsAdded++;
        console.log(reservationsAdded+"/"+restaurantsData.length);
    };

    // restaurantsData = restaurantsData.slice(0,5); // debug with few items

    console.log("Feeding reservations info in orion.");
    console.log("Number of restaurants: " + restaurantsData.length);

    // Limit the number of calls to be done in parallel to orion
    var q = async.queue(function (task, callback) {
        var rname = task.rname;
        var attributes = task.attributes;

        auth_request("v2/entities", "POST", attributes , callback);
    }, apiRestSimtasks);


    q.drain = function() {
        console.log("Total reservations added: " + reservationsAdded);
    }

    Object.keys(restaurantsData).forEach(function(element, pos, _array) {
        // Call orion to append the entity
        var rname = restaurantsData[pos].id;
        rname += "-"+shortid.generate();

        //var address = restaurantsData[pos].contextElement.attributes[0];
        //address.value[0].value = utils.fixedEncodeURIComponent(address.value[0].value);

        var reservations = ["Cancelled","Confirmed","Hold","Pending"];

        var attr = {"@context": "http://schema.org", 
                    "type": "FoodEstablishmentReservation", 
                    "id":rname,
                    "reservationStatus":utils.randomElement(reservations), 
                    "underName": {},
                    "reservationFor": {},
                    "startTime": utils.getRandomDate(),
                    "partySize": utils.randomIntInc(1,20)};

        // Time to add first attribute to orion as first approach
        attr.underName["@type"] = "Person";
        attr.underName["name"] = "user"+utils.randomIntInc(1,10);

        attr.reservationFor["@type"] = "FoodEstablishment";
        attr.reservationFor["name"] = restaurantsData[pos].id;
        attr.reservationFor["address"] = restaurantsData[pos].address;

        q.push({"rname":rname, "attributes":attr}, returnPost);
    });
};

// Load restaurant data from Orion
var loadRestaurantData = function() {

    var processRestaurants = function (data) {
        restaurantsData = JSON.parse(JSON.stringify(data));
        // Once we have all data for restaurants generate reviews for them
        feedOrionReservations();
    };

    auth_request("v2/entities", "GET", { "type":"Restaurant", "limit":"1000" } , processRestaurants);
};

console.log("Generating random reservations for restaurants ...");

loadRestaurantData();
