// Feeds restaurants into Orion CB
var utils = require('./utils');
var fs = require('fs');

var feed_url = "http://opendata.euskadi.eus";
var feed_path = "/contenidos/ds_recursos_turisticos";
feed_path += "/restaurantes_sidrerias_bodegas/opendata/restaurantes.json";
var cache_file = "restaurants.json";
var cache_file_geo = "restaurants_geo.json";
var cache_geo = {};
// var api_rest_host = "localhost";
var api_rest_port = 3000; // Dev with Express
var api_rest_host = "compose_devguide_1";
// var api_rest_port = 80;
var restaurants_added = 0;
var geo_wait_time_ms = 1000; // Wait ms between calls to Google API
var restaurants_data; // All data for the restaurants

var api_count = 0;
var get_geocode_api_next = function(pos, data) {
    // console.log("API call ...");
    cache_geo[restaurants_data[pos].address] = data;
    if (pos < restaurants_data.length-1) {
        setTimeout(get_geocode_api(++pos), geo_wait_time_ms);
    } else {
        // Once all read write to cache file
        // fs.writeFileSync(cache_file_geo, JSON.stringify(cache_geo));
        console.log("TOTAL API CALLS: " + api_count);
        throw("");
    }
}

// pos: position in restaurant_data array
var get_geocode_api = function(pos) {
    api_count++;
    get_geocode_api_next (pos, "TEST");
    return;
    var address = restaurants_data[pos].address;

    var url_path = "/maps/api/geocode/json?";
    url_path += "region=es&address="+encodeURIComponent(address);
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
    utils.do_get(options, get_geocode_api_next, pos, https);
};

function get_geocode (address) {
    var res;

    if (cache_geo[address] === undefined) {
        console.log("Can't read geocodes");
    } else {
        var geocode = cache_geo[address].results[0].geometry.location;
        res = geocode;
    }

    return res;
}

// Try to convert all address to geocode
function read_geo_data() {
    var api_key = process.argv[2];
    if (api_key === undefined) {
        console.log("Please provide an API key:");
        console.log("node restaurant_feeder.js <api_key_google_geocode>");
        throw("API key needed for geocodes.");
    }

    get_geocode_api(0);
}


var feed_orion_restaurants = function() {
    return_post = function(res, buffer, headers) {
        restaurants_added++;
        console.log(buffer);
    };

    try {
        var data = fs.readFileSync(cache_file_geo);
        cache_geo = JSON.parse(data);
    } catch (e) {
        console.log("Reading geocodes ... be patient ...");
        read_geo_data(restaurants_data);
    }

    restaurants_data = restaurants_data.slice(0,10); // debug with few items

    console.log("Feeding restaurants info in orion.");
    console.log("Total tried: " + restaurants_data.length);
    Object.keys(restaurants_data).forEach(function(element, key, _array) {
        // Call orion to append the entity
        var rname = restaurants_data[key].documentName;
        // Time to add first attribute to orion as first approach
        var attributes = [];
        // Object.keys(restaurants_data[key]).forEach(function(element) {
        Object.keys(restaurants_data[key]).slice(0,2).forEach(function(element) {
            var val = restaurants_data[key][element];
            var address = restaurants_data[key].address + " " + restaurants_data[key].municipality;
            var geocode = get_geocode(address);
            // Orion does not support empty values in APPEND
            if (val === '') {
                val = " ";
            }
            var attr = {"name":element,
                        "type":"NA",
                        "value":val};
            attributes.push(attr)
        });
        console.log("Adding restaurant " + rname)
        var api_rest_path = "/api/orion/entities/";
        var org_name = "devguide";
        var context_id = rname;
        var temperature_id = "NA";
        api_rest_path += org_name;

        // Time to build the Context Element in Orion language
        var post_data = {
            "contextElements": [
                    {
                        "type": "restaurant",
                        "isPattern": "false",
                        "id": context_id,
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
        utils.do_post(options, post_data, return_post);
    });
};

console.log("Geeting restaurants info ...");

try {
    var data = fs.readFileSync(cache_file);
    console.log("Using cache file " + cache_file);
    restaurants_data = JSON.parse(data);
    feed_orion_restaurants();
} catch (e) {
    if (e.code === 'ENOENT') {
        console.log("Downloading data ... be patient");
        var exec = require('child_process').exec, child;

        cmd = "curl " + feed_url + feed_path + " -o " + cache_file;

        child = exec(cmd,
          function (error, stdout, stderr) {
            if (error !== null) {
              console.log('exec error: ' + error);
              return;
            }
            restaurants_data = JSON.parse(fs.readFileSync(cache_file));
            feed_orion_restaurants();
        });
    } else {
        throw e;
    }
}