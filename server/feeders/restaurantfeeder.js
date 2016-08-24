/*
 * restaurantfeeder.js
 * Copyright(c) 2015 Bitergia
 * Author: Alvaro del Castillo <acs@bitergia.com>,
 * Alberto Martín <alberto.martin@bitergia.com>
 * MIT Licensed
 *
 *  Feeds restaurants into Orion CB
 *
 *  First it gets all restaurant information from the JSON file and
 *  the geolocation objects from the GEO JSON file
 *  Then all restaurant data is added to Orion CB
*/

// jshint node: true

'use strict';

var path = require('path');
var utils = require('../utils');
var config = require('../config');
var fs = require('fs');

var RESTAURANT_TYPE = 'Restaurant';
var POSTAL_ADDRESS_TYPE = 'PostalAddress';
var PROPERTY_VALUE_TYPE = 'PropertyValue';
var DATE_TYPE = 'DateTime';
var AGGREGATE_RATING_TYPE = 'AggregateRating';

var cacheFile = '../data/restaurants.json';
var geolocationFile = '../data/restaurantsGeo.json';
var restaurantsAdded = 0;
var restaurantsData; // All data for the restaurants
var geoData;
var restaurantSelected;
var numberOfRestaurants;

var fiwareHeaders = {
  'fiware-service': config.fiwareService
};

/**
 * Function to display a help menu using the CLI
*/
function showHelp() {
  var progname = path.basename(process.argv[1]);
  // jshint multistr: true, maxlen: false
  // jscs:disable maximumLineLength, disallowMultipleLineStrings
  var helpMessage = [
    '',
    'Generate restaurants based in Open Euskadi JSON and load it into Orion Context Broker.',
    '',
    'Usage: ' + progname + ' <options>',
    '',
    'Available options:',
    '',
    '  -h  --help                          Show this help.',
    '  -f  --jsonfile                      Use a different JSON data from Open Euskadi.',
    '                                      (Feeder expects the same format).',
    '                                      It use by default the one provided in ',
    '                                      \'server/data/restaurants.json\'. ',
    '  -g  --geofile                       Use a different JSON data for restaurant Geolocation. ',
    '                                      It use by default the one provided in ',
    '                                      \'server/data/restaurantsGeo.json\' (retrieved with Google).',
    '  -r  --restaurant                    Load a single restaurant of the JSON provided using its name.',
    '  -n  --numberOfRestaurants           Load a defined number of restaurants among the ',
    '                                      provided ones (can\'t be used with the previous option).',
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
      g: 'geofile',
      r: 'restaurant',
      n: 'numberOfRestaurants'
    },
    default: {
      'jsonfile': '../data/restaurants.json',
      'geofile': '../data/restaurantsGeo.json'
    }
  });

  if (argv.help) {
    showHelp();
  }

  if (typeof argv.jsonfile === 'string' && argv.jsonfile !== '') {
    cacheFile = argv.jsonfile;
  }

  if (typeof argv.geofile === 'string' && argv.geofile !== '') {
    geolocationFile = argv.geofile;
  }

  if (typeof argv.restaurant === 'string' && argv.restaurant !== '') {
    restaurantSelected = argv.restaurant;
  }

  if (typeof argv.numberOfRestaurants === 'number' &&
      argv.numberOfRestaurants !== '') {
    numberOfRestaurants = argv.numberOfRestaurants;
  }

  if (argv.restaurant && argv.numberOfRestaurants) {
    console.error('\'restaurant\' and \'numberOfRestaurants\' ' +
                  'are incompatible. Please try again.');
    showHelp();
    process.exit(1);
  }
}

/**
 * Function that logs the progress of the restaurants loading
 *
 * @param {String} restaurantIdentifier - Restaurant identifier
*/
function logProgress(restaurantIdentifier) {
  if (restaurantIdentifier) {
    console.warn('The restaurant', restaurantIdentifier, 'exists');
  } else {
    restaurantsAdded++;
    console.info(restaurantsAdded + '/' + restaurantsData.length);
  }
}

/**
 * Function to read the restaurant information from a given file
*/
function loadRestaurantData() {
  console.info('Loading restaurants info ...');
  var data = fs.readFileSync(cacheFile);
  restaurantsData = JSON.parse(data);

  if (restaurantSelected) {
    restaurantsData = restaurantsData.filter(function(element) {
      if (restaurantSelected === element.documentName) {
        return true;
      }
    });
  }
  if (numberOfRestaurants) {
    restaurantsData = restaurantsData.slice(0,numberOfRestaurants);
  }
}

/**
 * Function to read the Geolocation information from a given file
*/
function loadGeoData() {
  var data = fs.readFileSync(geolocationFile);
  geoData = JSON.parse(data);
}

/**
 * Function that adapts the information for Orion Context Broker
*/
function feedOrionRestaurants() {
  console.info('Feeding restaurants info in orion.');
  console.info('Number of restaurants: ' + restaurantsData.length);

  var dictionary = {
    'id': 'name',
    'addressFax': 'faxNumber',
    'menu': 'priceRange',
    'phoneNumber': 'telephone',
    'turismDescription': 'description',
    'web': 'url'
  };

  var addressDictionary = {
    'address': 'streetAddress',
    'locality': 'addressLocality',
    'historicTerritory': 'addressRegion',
    'municipalityCode': 'postalCode'
  };

  var organization = ['Franchise1', 'Franchise2',
  'Franchise3', 'Franchise4'
  ];
  var capacity = [50, 80, 100, 120, 160, 200];

  restaurantsData.forEach(function(element, index) {
    var rname = utils.fixedEncodeURIComponent(
      restaurantsData[index].documentName);

    var attr = {
      'type': RESTAURANT_TYPE,
      'id': utils.generateId(rname),
      'address': {
        'type': POSTAL_ADDRESS_TYPE,
        'value': {}
      },
      'name': {
        'value': rname
      },
      'department': {
        'value': utils.randomElement(organization)
      },
      'capacity': {
        'type': PROPERTY_VALUE_TYPE,
        'value': utils.randomElement(capacity)
      },
      'aggregateRating': {
        'type': AGGREGATE_RATING_TYPE,
        'value': {
          'ratingValue': utils.randomIntInc(1, 5),
          'reviewCount': utils.randomIntInc(1, 100)
        }
      },
      'occupancyLevels': {
        'metadata': {
          'timestamp': {
            'type': DATE_TYPE,
            'value': new Date().toISOString()
          }
        },
        'type': PROPERTY_VALUE_TYPE,
        'value': 0
      }
    };

    Object.keys(restaurantsData[index]).forEach(function(element) {
      var val = restaurantsData[index][element];
      if (val) {
        if (element in addressDictionary) {
          element = utils.fixedEncodeURIComponent(
            utils.replaceOnceUsingDictionary(addressDictionary, element));
          attr.address.value[element] = utils.fixedEncodeURIComponent(val);
        } else if (element in dictionary) {
          element = utils.fixedEncodeURIComponent(
            utils.replaceOnceUsingDictionary(dictionary, element));
          if (element == 'priceRange') {
            attr[element] = {
              'value': parseFloat(val)
            };
          } else {
            attr[element] = {
              'value': utils.fixedEncodeURIComponent(
                utils.convertHtmlToText(val))
            };
          }
        }
      }
    });
    sendRestaurant(attr);
  });
}

/**
 * Function that sends the information to Orion Context Broker
 *
 * @param {String} restaurant - Restaurant to load
*/
function sendRestaurant(restaurant) {
  var fwHeaders = JSON.parse(JSON.stringify(fiwareHeaders));
  utils.getListByType('Restaurant', restaurant.id, fwHeaders)
  .then(function(data) {
    logProgress(restaurant.id);
  })
  .catch(function(err) {
    if (err.statusCode == '404') {
      if (restaurant.department.value) {
        fwHeaders['fiware-servicepath'] = '/' + restaurant.department.value;
      }
      restaurant = utils.addGeolocation(restaurant, geoData[restaurant.id]);
      restaurant = utils.completeAddress(restaurant, geoData[restaurant.id]);
      utils.sendRequest('POST', restaurant, null, fwHeaders)
      .then(logProgress(null))
      .catch(function(err) {
        console.error(err);
      });
    }
  });
}

parseArgs();
loadRestaurantData();
loadGeoData();
feedOrionRestaurants();
