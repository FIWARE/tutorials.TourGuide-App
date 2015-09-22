/*
 * reviews_generator.js
 * Copyright(c) 2015 Bitergia
 * Author: Alvaro del Castillo <acs@bitergia.com>
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

var api_rest_host = "compose_devguide_1";
var api_rest_port = 80;
var api_rest_simtasks = 2 // number of simultaneous calls to API REST
var reviews_added = 0;
var restaurants_data; // All data for the restaurants to be reviewed

var feed_orion_reviews = function() {
    return_post = function(res, buffer, headers) {
        reviews_added++;
        console.log(reviews_added+"/"+restaurants_data.length);
    };

    // restaurants_data = restaurants_data.slice(0,5); // debug with few items

    console.log("Feeding reviews info in orion.");
    console.log("Total tried: " + restaurants_data.length);

    var api_rest_path = "/api/orion/entities/";
    var org_name = "devguide";

    // Limit the number of calls to be done in parallel to orion
    var q = async.queue(function (task, callback) {
        var rname = task.rname;
        var attributes = task.attributes;

        auth_request("v2/entities", "POST", attributes , callback);
    }, api_rest_simtasks);


    q.drain = function() {
        console.log("Total reviews added: " + reviews_added);
    }

    Object.keys(restaurants_data).forEach(function(element, pos, _array) {
        // Call orion to append the entity
        var rname = restaurants_data[pos].id;
        rname += "-"+shortid.generate();
        // Time to add first attribute to orion as first approach

        var attr = {"@context": "http://schema.org", 
                    "type": "Review", 
                    "id":encodeURIComponent(rname),
                    "itemReviewed":{}, 
                    "reviewRating": {},
                    "name": "Rating description",
                    "author": {},
                    "reviewBody": "Body review",
                    "publisher": {}};

        attr.itemReviewed["@type"]="Restaurant";
        attr.itemReviewed["name"]=restaurants_data[pos].id;

        attr.reviewRating["@type"]="Rating";
        attr.reviewRating["ratingValue"]=utils.randomIntInc(1,5);

        attr.author["@type"]="Person";
        attr.author["name"]="user"+utils.randomIntInc(1,10);

        attr.publisher["@type"]="Organization";
        attr.publisher["name"]="Bitergia";

        q.push({"rname":rname, "attributes":attr}, return_post);
    });
};

// Load restaurant data from Orion
var load_restaurant_data = function() {

    var process_restaurants = function (data) {
        restaurants_data = JSON.parse(JSON.stringify(data));
        // Once we have all data for restaurants generate reviews for them
        feed_orion_reviews();
    };

    auth_request("v2/entities", "GET", { "type":"Restaurant", "limit":"1000" } , process_restaurants);
};

console.log("Generating random reviews for restaurants ...");

load_restaurant_data();
