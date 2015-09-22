/*
 * reviews_generator.js
 * Copyright(c) 2015 Bitergia
 * Author: Alvaro del Castillo <acs@bitergia.com>, Alberto Martín <amartin@bitergia.com>
 * MIT Licensed

  Generates random reviews for restaurants in orion

  First it gets all restaurant information
  Then a random automatic review is generated 
  Then the review is added to Orion CB

  TODO:
  - Create more real reviews using templates for comments and random ratings
*/


var utils = require('../utils');
var fs = require('fs');
var async = require('async');
var shortid = require('shortid'); // unique ids generator
var auth_request = require('../auth_request');
var apiRestSimtasks = 2 // number of simultaneous calls to API REST
var reviewsAdded = 0;
var restaurantsData; // All data for the restaurants to be reviewed

var feedOrionReviews = function() {
    returnPost = function(res, buffer, headers) {
        reviewsAdded++;
        console.log(reviewsAdded+"/"+restaurantsData.length);
    };

    // restaurantsData = restaurantsData.slice(0,5); // debug with few items

    console.log("Feeding reviews info in orion.");
    console.log("Total tried: " + restaurantsData.length);

    // Limit the number of calls to be done in parallel to orion
    var q = async.queue(function (task, callback) {
        var rname = task.rname;
        var attributes = task.attributes;

        auth_request("v2/entities", "POST", attributes , callback);
    }, apiRestSimtasks);


    q.drain = function() {
        console.log("Total reviews added: " + reviewsAdded);
    }

    Object.keys(restaurantsData).forEach(function(element, pos, _array) {
        // Call orion to append the entity
        var rname = restaurantsData[pos].id;
        rname += "-"+shortid.generate();
        // Time to add first attribute to orion as first approach

        var attr = {"@context": "http://schema.org", 
                    "type": "Review", 
                    "id":rname,
                    "itemReviewed":{}, 
                    "reviewRating": {},
                    "name": "Rating description",
                    "author": {},
                    "reviewBody": "Body review",
                    "publisher": {}};

        attr.itemReviewed["@type"]="Restaurant";
        attr.itemReviewed["name"]=restaurantsData[pos].id;

        attr.reviewRating["@type"]="Rating";
        attr.reviewRating["ratingValue"]=utils.randomIntInc(1,5);

        attr.author["@type"]="Person";
        attr.author["name"]="user"+utils.randomIntInc(1,10);

        attr.publisher["@type"]="Organization";
        attr.publisher["name"]="Bitergia";

        q.push({"rname":rname, "attributes":attr}, returnPost);
    });
};

// Load restaurant data from Orion
var loadRestaurantData = function() {

    var processRestaurants = function (data) {
        restaurantsData = JSON.parse(JSON.stringify(data));
        // Once we have all data for restaurants generate reviews for them
        feedOrionReviews();
    };

    auth_request("v2/entities", "GET", { "type":"Restaurant", "limit":"1000" } , processRestaurants);
};

console.log("Generating random reviews for restaurants ...");

loadRestaurantData();
