/*
 * restaurant_feeder.js
 * Copyright(c) 2015 Bitergia
 * Author: Alvaro del Castillo <acs@bitergia.com>
 * MIT Licensed

  Feeds restaurants into Orion CB

  First it gets all restaurant information
  Then restaurant geocode is gathered using Google API in serial execution
  Then all restaurant data is added to Orion CB
*/


var utils = require('./utils');
var fs = require('fs');
var async = require('async');

var feed_host = "opendata.euskadi.eus";
var feed_url = "http://"+feed_host;
var feed_path = "/contenidos/ds_recursos_turisticos";
feed_path += "/restaurantes_sidrerias_bodegas/opendata/restaurantes.json";
var cache_file = "restaurants.json";
var cache_file_geo = "restaurants_geo.json";
var cache_geo = {};
// var api_rest_host = "localhost";
// var api_rest_port = 3000; // Dev with Express
var api_rest_host = "compose_devguide_1";
var api_rest_port = 80;
var api_rest_simtasks = 5 // number of simultaneous calls to API REST
var restaurants_added = 0;
var geo_wait_time_ms = 1000; // Wait ms between calls to Google API
var restaurants_data; // All data for the restaurants
var api_count = 0; // 2500 requests per day, be careful

function get_address(restaurant) {
    var address = restaurant.address + " ";
    address += restaurant.municipality;
    return address;
}

var get_geocode_api_next = function(pos, data) {
    var total = restaurants_data.length;
    try {
        var geocode_json = JSON.parse(data);
        cache_geo[get_address(restaurants_data[pos])] = geocode_json;
    } catch (e) {
        cache_geo[get_address(restaurants_data[pos])] = data;
    }

    if (pos < total-1) {
        console.log("API call " + pos + "/" + (total-1));
        setTimeout(function() {get_geocode_api(++pos);}, geo_wait_time_ms);
    } else {
        // Once all read, write to cache file and feed data to orion
        fs.writeFileSync(cache_file_geo, JSON.stringify(cache_geo));
        console.log("TOTAL API CALLS: " + api_count);
        feed_orion_restaurants();
    }
}

// pos: position in restaurant_data array
var get_geocode_api = function(pos) {
    // First check if we already have the data
    var address = get_address(restaurants_data[pos]);

    if (cache_geo[address] !== undefined) {
        get_geocode_api_next (pos, cache_geo[address]);
        return
    }

    var api_key = process.argv[2];
    var url_path = "/maps/api/geocode/json?";
    url_path += "region=es&"; // All our restaurants are from Spain
    url_path += "address="+encodeURIComponent(address);
    url_path += "&key="+api_key;
    var headers = {
            'Accept': 'application/json',
    };

    var options = {
        host: "maps.googleapis.com",
        path: url_path,
        method: 'GET',
        headers: headers
    };
    var https = true;
    api_count++;
    utils.do_get(options, get_geocode_api_next, pos, https);
};



function get_geocode (address) {
    var geocode;

    if (cache_geo[address] === undefined) {
        console.log("Can't read geocodes");
    } else {
        if (cache_geo[address].results !== undefined &&
            Array.isArray(cache_geo[address].results) &&
            cache_geo[address].results[0] != undefined) {
            geocode_raw = cache_geo[address].results[0].geometry.location;
            geocode = geocode_raw.lat+", "+geocode_raw.lng;
        } else {
            console.log("Bad geocode data: " + cache_geo[address]);
        }
    }

    return geocode;
}

// Try to convert all address to geocode
function read_geo_data_feed_orion() {
    try {
        var data = fs.readFileSync(cache_file_geo);
        cache_geo = JSON.parse(data);
        feed_orion_restaurants();
    } catch (e) {
        if (e.code === 'ENOENT') {
            var max_time = restaurants_data.length * geo_wait_time_ms / 1000;
            console.log("Reading geocodes ... be patient ...");
            console.log("Max time needed: " + max_time + " seconds.");
            var api_key = process.argv[2];
            if (api_key === undefined) {
                console.log("Please provide an API key:");
                console.log("node restaurant_feeder.js <api_key_google_geocode>");
                throw("API key needed for geocodes.");
            }
            get_geocode_api(0);
        } else {
            throw(e);
        }
    }
}

function fixedEncodeURIComponent (str) {
    str=str.replace(/["]/g,'\\"');
    str=str.replace(/\n/g,'\\n');
    return str.replace(/[<>"'=;()\n\\]/g, function(c) {
	var hex;
	hex = c.charCodeAt( 0 ).toString( 16 );
	return '%' + ((hex.length==2) ? hex : '0' + hex );
    });
}

var feed_orion_restaurants = function() {
    return_post = function(res, buffer, headers) {
        restaurants_added++;
        // console.log(buffer);
        console.log(restaurants_added+"/"+restaurants_data.length);
    };

    // restaurants_data = restaurants_data.slice(0,5); // debug with few items

    console.log("Feeding restaurants info in orion.");
    console.log("Number of restaurants: " + restaurants_data.length);

    var api_rest_path = "/api/orion/entities/";
    var org_name = "devguide";
    var temperature_id = "NA";

    // Limit the number of calls to be done in parallel to orion
    var q = async.queue(function (task, callback) {
        var rname = task.rname;
        var attributes = task.attributes;
        // console.log(attributes);
        var context_id = rname;

        // Time to build the Context Element in Orion language
        var post_data = {
            "contextElements": [
                    {
                        "type": "restaurant",
                        "isPattern": "false",
                        "id": fixedEncodeURIComponent(context_id),
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
                path: api_rest_path+org_name,
                method: 'POST',
                headers: headers
            };
        utils.do_post(options, post_data, callback);
    }, api_rest_simtasks);


    q.drain = function() {
        console.log("Total restaurants added: " + restaurants_added);
    }

    Object.keys(restaurants_data).forEach(function(element, pos, _array) {
        // Call orion to append the entity
        var rname = restaurants_data[pos].documentName;
        // Time to add first attribute to orion as first approach
        var attributes = [];
        var address = get_address(restaurants_data[pos]);
        var geocode = get_geocode(address);
        // console.log(geocode);
        // Orion location attribute: http://bit.ly/1CmagJz
        geo_attr = {"name":"location","type":"coords","value":geocode};
        geo_attr.metadatas = [{
                               "name": "location",
                               "type": "string",
                               "value": "WGS84"
                             }];
        attributes.push(geo_attr);
        Object.keys(restaurants_data[pos]).forEach(function(element) {
        // Object.keys(restaurants_data[pos]).slice(0,2).forEach(function(element) {
            var val = restaurants_data[pos][element];
            // Orion does not support empty values in APPEND
            if (val === '') {
                val = " ";
            }
            var attr = {"name":element,
                        "type":"NA",
                        "value":fixedEncodeURIComponent(val)};
            attributes.push(attr)
        });
        q.push({"rname":rname, "attributes":attributes}, return_post);
    });
};

// Load restaurant data in Orion
var load_restaurant_data = function() {
    var process_get = function(res, data) {
        fs.writeFileSync(cache_file, data);
        restaurants_data = JSON.parse(data);
        read_geo_data_feed_orion();
    };

    try {
        var data = fs.readFileSync(cache_file);
        console.log("Using cache file " + cache_file);
        restaurants_data = JSON.parse(data);
        read_geo_data_feed_orion();
    } catch (e) {
        if (e.code === 'ENOENT') {
            console.log("Downloading data ... be patient");

            var headers = {
                    'Accept': 'application/json',
            };

            var options = {
                host: feed_host,
                path: feed_path,
                method: 'GET',
                headers: headers
            };
            utils.do_get(options, process_get);

        } else {
            throw e;
        }
    }
};

console.log("Loading restaurants info ...");

load_restaurant_data();
