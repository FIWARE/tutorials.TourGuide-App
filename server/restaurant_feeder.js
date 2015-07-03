// Feeds restaurants into Orion CB
var utils = require('./utils');
var fs = require('fs');

var feed_url = "http://opendata.euskadi.eus";
var feed_path = "/contenidos/ds_recursos_turisticos";
feed_path += "/restaurantes_sidrerias_bodegas/opendata/restaurantes.json";
var cache_file = "restaurants.json";
// var api_rest_host = "localhost";
// var api_rest_port = 3000; // Dev with Express
var api_rest_host = "compose_devguide_1";
var api_rest_port = 80;
var restaurants_added = 0;

var feed_orion_restaurants = function(jdata) {
    return_post = function(res, buffer, headers) {
        restaurants_added++;
        // console.log(buffer);
    };

    // jdata = jdata.slice(0,1); // debug with 1 item

    console.log("Feeding restaurants info in orion.");
    console.log("Total tried: " + jdata.length);
    Object.keys(jdata).forEach(function(element, key, _array) {
        // Call orion to append the entity
        var rname = jdata[key].documentName;
        // Time to add first attribute to orion as first approach
        var attributes = [];
        Object.keys(jdata[key]).forEach(function(element) {
        // Object.keys(jdata[key]).slice(0,2).forEach(function(element) {
            console.log(jdata[key][element]);
            var val = jdata[key][element];
            // Orion does not support empty values in APPEND
            if (val === '') {
                val = " ";
            }
            var attr = {"name":element,
                        "type":"NA",
                        "value":val};
            attributes.push(attr)
        });
        console.log(attributes);
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
                        "type": "restaurant1",
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
            'Content-Length': post_data.length
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
    var jdata = JSON.parse(data);
    console.log("Using cache file " + cache_file);
    feed_orion_restaurants(jdata);
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
            feed_orion_restaurants(JSON.parse(fs.readFileSync(cache_file))) ;
        });
    } else {
        throw e;
    }
}



