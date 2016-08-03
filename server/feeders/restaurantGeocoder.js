/*
 * restaurantGeocoder.js
 * Copyright(c) 2016 Bitergia
 * Author: Alberto Martín <alberto.martin@bitergia.com>
 * MIT Licensed
 *
 *  Geocodes and generates a file with the geocoding information of each restaurant
*/

// jshint node: true

'use strict';

var path = require('path');
var utils = require('../utils');
var fs = require('fs');
var async = require('async');
var geocoder = require('node-geocoder')('google', 'http');
var cacheFile = '../data/restaurants.json';
var outputFile = '../data/restaurantsGeo.json';
var apiRestSimtasks = 1; // number of simultaneous calls to API REST
var geoWaitTimeMs = 2000; // Wait ms between calls to Google API
var restaurantsData; // All data for the restaurants
var geocodes = {};
var restaurantsAdded = 0;

/**
 * Function to display a help menu using the CLI
*/
function showHelp() {
  var progname = path.basename(process.argv[1]);
  // jshint multistr: true, maxlen: false
  // jscs:disable maximumLineLength, disallowMultipleLineStrings
  var helpMessage = [
    '',
    'Generate geocoding objects for the Open Euskadi set of restaurants.',
    '',
    'Usage: ' + progname + ' <options>',
    '',
    'Available options:',
    '',
    '  -h  --help                          Show this help.',
    '  -f  --jsonfile                      Use a different JSON data from Open Euskadi.',
    '                                      It use by default the provided one in ',
    '                                      \'server/data/restaurants.json\'. ',
    '  -o  --output                        File where to store the geocoding data. ',
    '                                      It will be stored by default at ',
    '                                      \'server/data/restaurantsGeo.json\'.',
    ''].join('\n');
  // jshint multistr: false, maxlen: 80
  // jscs:enable
  console.log(helpMessage);
  process.exit(0);
}

/**
 * Function to parse the arguments given launching the script
*/
function parseArgs() {
  if (process.argv.length < 3) {
    // no args, use defaults
    return;
  }

  var argv = require('minimist')(process.argv.slice(2), {
    alias: {
      h: 'help',
      f: 'jsonfile',
      o: 'output'
    },
    default: {
      'jsonfile': '../data/restaurants.json',
      'output': '../data/restaurantsGeo.json'
    }
  });

  if (argv.help) {
    showHelp();
  }

  if (typeof argv.jsonfile === 'string' &&
      argv.jsonfile !== '') {
    cacheFile = argv.jsonfile;
  }

  if (typeof argv.output === 'string' &&
      argv.output !== '') {
    outputFile = argv.output;
  }
}

/**
 * Function to wrap the location information into a String
 *
 * @param {Object} restaurant - Restaurant object
 * @return {String} address - Returns the address formatted for geocoding
*/
function getAddress(restaurant) {
  var address = restaurant.address + ' ';
  if (restaurant.locality) {
    address += restaurant.locality + ' ';
  }
  if (restaurant.historicTerritory) {
    address += restaurant.historicTerritory;
  }
  return address;
}

/**
 * Function to read the restaurant information from a given file
*/
function loadRestaurantData() {
  var data = fs.readFileSync(cacheFile);
  restaurantsData = JSON.parse(data);
}

/**
 * Function that writes the Geocoding data into a JSON file
 *
 * @param {String} geocodes - List of the geocoding data
*/
function writeOutput(geocodes) {
  var json = JSON.stringify(geocodes, null, '\t');
  fs.writeFileSync(outputFile, json);
}

/**
 * Function to log the progress of the Geolocation process
 *
 * @param {String} restaurantIdentifier - Restaurant identifier
*/
function logProgress(restaurantIdentifier) {
  restaurantsAdded++;
  console.info(restaurantsAdded + '/' + restaurantsData.length +
    ' Restaurant named', restaurantIdentifier, 'geolocated');
}

/**
 * Function that handles the Geolocation process of every restaurant
 *
 * @param {List} restaurants - List of the restaurants
*/
function exportGeocode(restaurants) {

  //restaurantsData = restaurantsData.slice(0,5);

  var q = async.queue(function(task, callback) {
    var attributes = task.attributes;
    var address = getAddress(attributes);
    setTimeout(function() {
      geocoder.geocode({address: address, country: 'Spain'})
      .then(function(geoRes) {
        geocodes[attributes.id] = geoRes[0];
        callback(attributes.documentName);
      })
      .catch(function(err) {
        console.err(err);
      });
    }, geoWaitTimeMs);
  }, apiRestSimtasks);

  q.drain = function() {
    console.log('Total restaurants geolocated: ' + restaurantsAdded);
    writeOutput(geocodes);
  };

  Object.keys(restaurantsData).forEach(function(element, index) {
    var rname = utils.fixedEncodeURIComponent(
      restaurantsData[index].documentName);

    var attr = restaurantsData[index];
    attr.id = utils.generateId(rname);
    q.push({'attributes': attr}, logProgress);
  });
}

parseArgs();
loadRestaurantData();
exportGeocode(restaurantsData);
