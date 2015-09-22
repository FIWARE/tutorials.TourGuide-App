/*
 * restaurant_feederv2.js
 * Copyright(c) 2015 Bitergia
 * Author: Alvaro del Castillo <acs@bitergia.com>, Alberto Martín <alberto.martin@bitergia.com>
 * MIT Licensed

  Feeds restaurants into Orion CB

  First it gets all restaurant information
  Then restaurant geocode is gathered using Google API in serial execution
  Then all restaurant data is added to Orion CB
*/


var utils = require('../utils');
var auth_request = require('../auth_request');
var fs = require('fs');
var async = require('async');

var feedHost = "opendata.euskadi.eus";
var feedUrl = "http://"+feedHost;
var feedPath = "/contenidos/ds_recursos_turisticos";
feedPath += "/restaurantes_sidrerias_bodegas/opendata/restaurantes.json";
var cacheFile = "../data/restaurants.json";
var cacheFileGeo = "../data/restaurants_geo.json";
var cacheGeo = {};
var apiRestSimtasks = 5; // number of simultaneous calls to API REST
var restaurantsAdded = 0;
var geoWaitTimeMs = 1000; // Wait ms between calls to Google API
var restaurantsData; // All data for the restaurants
var apiCount = 0; // 2500 requests per day, be careful

function getAddress(restaurant) {
    var address = restaurant.address + " ";
    address += restaurant.municipality;
    return address;
}

var getGeocodeApiNext = function(pos, data) {
    var total = restaurantsData.length;
    try {
        var geocodeJson = JSON.parse(data);
        cacheGeo[getAddress(restaurantsData[pos])] = geocodeJson;
    } catch (e) {
        cacheGeo[getAddress(restaurantsData[pos])] = data;
    }

    if (pos < total-1) {
        console.log("API call " + pos + "/" + (total-1));
        setTimeout(function() {getGeocodeApi(++pos);}, geoWaitTimeMs);
    } else {
        // Once all read, write to cache file and feed data to orion
        fs.writeFileSync(cacheFileGeo, JSON.stringify(cacheGeo));
        console.log("TOTAL API CALLS: " + apiCount);
        feedOrionRestaurants();
    }
}

// pos: position in restaurant_data array
var getGeocodeApi = function(pos) {
    // First check if we already have the data
    var address = getAddress(restaurantsData[pos]);

    if (cacheGeo[address] !== undefined) {
        getGeocodeApiNext (pos, cacheGeo[address]);
        return
    }

    var apiKey = process.argv[2];
    var urlPath = "/maps/api/geocode/json?";
    urlPath += "region=es&"; // All our restaurants are from Spain
    urlPath += "address="+encodeURIComponent(address);
    urlPath += "&key="+apiKey;
    var headers = {
            'Accept': 'application/json',
    };

    var options = {
        host: "maps.googleapis.com",
        path: urlPath,
        method: 'GET',
        headers: headers
    };
    var https = true;
    apiCount++;
    utils.do_get(options, getGeocodeApiNext, pos, https);
};



function getGeocode (address) {
    var geocode;

    if (cacheGeo[address] === undefined) {
        console.log("Can't read geocodes");
    } else {
        if (cacheGeo[address].results !== undefined &&
            Array.isArray(cacheGeo[address].results) &&
            cacheGeo[address].results[0] != undefined) {
            geocodeRaw = cacheGeo[address].results[0].geometry.location;
            geocode = geocodeRaw.lat+", "+geocodeRaw.lng;
        } else {
            console.log("Bad geocode data: " + cacheGeo[address]);
        }
    }

    return geocode;
}

// Try to convert all address to geocode
function readGeoDataFeedOrion() {
    try {
        var data = fs.readFileSync(cacheFileGeo);
        cacheGeo = JSON.parse(data);
        feedOrionRestaurants();
    } catch (e) {
        if (e.code === 'ENOENT') {
            var maxTime = restaurantsData.length * geoWaitTimeMs / 1000;
            console.log("Reading geocodes ... be patient ...");
            console.log("Max time needed: " + maxTime + " seconds.");
            var apiKey = process.argv[2];
            if (apiKey === undefined) {
                console.log("Please provide an API key:");
                console.log("node restaurant_feeder.js <apiKey_google_geocode>");
                throw("API key needed for geocodes.");
            }
            getGeocodeApi(0);
        } else {
            throw(e);
        }
    }
}

var feedOrionRestaurants = function() {
    returnPost = function(res, buffer, headers) {
        restaurantsAdded++;
         //console.log(buffer);
        console.log(restaurantsAdded+"/"+restaurantsData.length);
    };

    //restaurantsData = restaurantsData.slice(0,5); // debug with few items

    console.log("Feeding restaurants info in orion.");
    console.log("Number of restaurants: " + restaurantsData.length);

    // Limit the number of calls to be done in parallel to orion
    var q = async.queue(function (task, callback) {
        var rname = task.rname;
        var attributes = task.attributes;

        //console.log(attributes);

        auth_request("v2/entities", "POST", attributes , callback);
    }, apiRestSimtasks);


    q.drain = function() {
        console.log("Total restaurants added: " + restaurantsAdded);
    }

    var dictionary = {
        "id":"name",
        "addressFax":"faxNumber",
        "menu":"priceRange",
        "phoneNumber":"telephone",
        "turismDescription":"description",
        "web":"url"
    };

    var addressDictionary = {
        "address":"streetAddress",
        "locality":"addressLocality",
        "municipality":"addressRegion",
        "municipalityCode":"postalCode"
    };

    Object.keys(restaurantsData).forEach(function(element, pos, _array) {
        // Call orion to append the entity
        var rname = restaurantsData[pos].documentName;
        // Time to add first attribute to orion as first approach
        var organization = ["Franchise1","Franchise2","Franchise3","Franchise4"];

        var attr = {"@context": "http://schema.org", 
                    "type": "Restaurant", 
                    "id":encodeURIComponent(rname), 
                    "address": {},
                    "location": {},
                    "department": utils.randomElement(organization),
                    "aggregateRating": {}};

        attr.address["@type"] = "postalAddress";

        var address = getAddress(restaurantsData[pos]);
        var geocode = getGeocode(address);
        attr.location["value"] = geocode;
        attr.location["type"] = "geo:point";
        attr.location["crs"] = "WGS84";

        attr.aggregateRating["ratingValue"]= utils.randomIntInc(1,5);
        attr.aggregateRating["reviewCount"]= utils.randomIntInc(1,100);

        Object.keys(restaurantsData[pos]).forEach(function(element) {

            var val = restaurantsData[pos][element];

            if (element in addressDictionary) {

                if (val !== 'undefined' && val!=='' && val!=' ') {
                    element = utils.replaceOnceUsingDictionary(addressDictionary, element, function(key, dictionary){
                        return dictionary[key];
                    });
                    attr.address[utils.fixedEncodeURIComponent(element)] = utils.fixedEncodeURIComponent(encodeURIComponent(val));
                }

            } else {
                if (val !== 'undefined' && element in dictionary && val!=='' && val!=' ') {

                    element = utils.replaceOnceUsingDictionary(dictionary, element, function(key, dictionary){
                        return dictionary[key];
                    });
                    attr[utils.fixedEncodeURIComponent(element)] = utils.fixedEncodeURIComponent(encodeURIComponent(utils.convertHtmlToText(val)));

                }
            }

        });
        //console.log("Push done");
        q.push({"rname":rname, "attributes":attr}, returnPost);
        //console.log(attr);
    });
};

// Load restaurant data in Orion
var loadRestaurantData = function() {
    var processGet = function(res, data) {
        fs.writeFileSync(cacheFile, data);
        restaurantsData = JSON.parse(data);
        readGeoDataFeedOrion();
    };

    try {
        var data = fs.readFileSync(cacheFile);
        console.log("Using cache file " + cacheFile);
        restaurantsData = JSON.parse(data);
        readGeoDataFeedOrion();
    } catch (e) {
        if (e.code === 'ENOENT') {
            console.log("Downloading data ... be patient");

            var headers = {
                    'Accept': 'application/json',
            };

            var options = {
                host: feedHost,
                path: feedPath,
                method: 'GET',
                headers: headers
            };
            utils.do_get(options, processGet);

        } else {
            throw e;
        }
    }
};

console.log("Loading restaurants info ...");

loadRestaurantData();
