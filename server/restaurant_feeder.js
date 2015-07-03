// Feeds restaurants into Orion CB
var utils = require('./utils');
var fs = require('fs');

var feed_url = "http://opendata.euskadi.eus";
var feed_path = "/contenidos/ds_recursos_turisticos";
feed_path += "/restaurantes_sidrerias_bodegas/opendata/restaurantes.json";
var cache_file = "restaurants.json";
var orion_host = "orion";
var orion_port = "10026";

var feed_orion_restaurants = function(jdata) {
    console.log("Feeding restaurants info in orion.");
    Object.keys(jdata).forEach(function(element, key, _array) {
        console.log(jdata[key].documentName);
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



