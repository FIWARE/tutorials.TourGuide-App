/*
 * occupancyupdater.js
 * Copyright(c) 2015 Bitergia
 * Author: David Muriel <dmuriel@bitergia.com>,
 * MIT Licensed
 *
 *  Calculates and updates the occupancy levels for all the restaurants.
 *
 *  First it creates a new service.
 *  Then registers the sensors for each restaurant.
 *
*/

// jshint node: true

'use strict';

var path = require('path');
var utils = require('../utils');
var async = require('async');
var config = require('../config');
var fiwareHeaders = {
  'fiware-service': config.fiwareService
};
var updateContextBroker = true;
var limitRestaurantName = false;
var verbose = false;
var restaurantsData;
var intervalSeconds = 7200; // 2 hours in seconds

function showHelp() {
  var progname = path.basename(process.argv[1]);
  // jshint multistr: true, maxlen: false
  // jscs:disable maximumLineLength, disallowMultipleLineStrings
  var helpMessage = [
    '',
    'Usage: ' + progname + ' <options>',
    '',
    'Available options:',
    '',
    '  -h  --help                          Show this help.',
    '  -v  --verbose                       Increase logs verbosity.',
    '  -r  --restaurant <name>             Calculate occupancy level for <name> restaurant.',
    '  -i  --interval <seconds>            Set interval for reservations in seconds.',
    '                                      Default is 7200 (2 hours).',
    '  -n  --no-update                     Do not update data on contex broker.',
    ''].join('\n');
  // jshint multistr: false, maxlen: 80
  // jscs:enable
  console.log(helpMessage);
  process.exit(0);
}

function parseArgs() {
  if (process.argv.length < 3) {
    // no args, use defaults
    return;
  }

  var argv = require('minimist')(process.argv.slice(2), {
    alias: {
      h: 'help',
      v: 'verbose',
      r: 'restaurant',
      i: 'interval',
      n: 'no-update'
    },
    default: {
      'verbose': false,
      'restaurant': false,
      'interval': 7200,
      'no-update': false
    }
  });

  if (argv.help) {
    showHelp();
  }

  if (typeof argv['no-update'] === 'boolean' &&
      argv['no-update']) {
    updateContextBroker = false;
  }

  if (typeof argv.restaurant === 'string' &&
      argv.restaurant !== '') {
    limitRestaurantName = argv.restaurant;
  }

  if (typeof argv.interval === 'number') {
    if (argv.interval <= 0) {
      console.log('Warning: interval \'' + argv.interval +
                  '\' is not a positive integer. Using default value.');
    }
    if (argv.interval % 1 !== 0) {
      console.log('Warning: interval \'' + argv.interval +
                  '\' is not a positive integer. Using default value.');
    } else {
      intervalSeconds = argv.interval;
    }
  }

  if (typeof argv.verbose === 'boolean' &&
      argv.verbose) {
    verbose = true;
  }

  if (verbose) {
    console.log('Update context broker:', updateContextBroker);
    console.log('Limit action to single restaurant:', limitRestaurantName);
  }

}

/**
 * Get the restaurant reservations between two dates
 * From and to are timestamps in milliseconds
 *
 * @param {Object} restaurant - Restaurant object
 * @param {String} from - Datetime from
 * @param {String} to - Datetime to
 * @return {Promise} Returns the request response
 */
function getRestaurantReservationsByDate(restaurant, from, to) {
  var timeFrame = 'startTime==' + from + '..' + to;
  return utils.sendRequest(
    'GET',
    {'type': 'FoodEstablishmentReservation',
     'q': timeFrame,
     'limit': 1000},
    null,
    fiwareHeaders)
      .then(
        function(data) {
          return utils.getRestaurantReservations(
            restaurant.id,
            data.body
          );
        })
      .catch(
        function(err) {
          console.error('ERROR: Failed to get reservations:', err.message);
          return null;
        }
      );
}

function getOccupancyLevelByDate(restaurant, from, to) {
  var occupancyLevel = 0;

  return getRestaurantReservationsByDate(restaurant, from, to)
    .then(
      function(reservations) {
        reservations = utils.objectToArray(reservations);
        if (reservations !== null) {
          // calculate expected occupancy level from the reservations
          reservations.filter(function(element) {
            if (element.reservationStatus === 'Confirmed') {
              occupancyLevel += element.partySize;
              return true;
            } else {
              return false;
            }
          });
          return occupancyLevel;
        } else {
          console.log('No reservations found for restaurant', restaurant.id);
          return occupancyLevel;
        }
      }
    )
    .catch(
      function(err) {
        return err;
      }
    );
}

function updateRestaurants() {
  var to = Date.now(); // in milliseconds
  var from = to - (intervalSeconds * 1000);
  var count = 0;
  var maxCount = 0;
  function updateProgressIndicator(callback, err) {
    count++;
    process.stdout.write(count + '/' + maxCount + '\r');
    if (count === maxCount) {
      process.stdout.write('\n');
    }
    callback(err);
  }

  function processRestaurant(restaurant, callback) {
    if (verbose) {
      console.log('Processing:',restaurant.id);
    }
    getOccupancyLevelByDate(restaurant, from, to)
      .then(
        function(occupancyLevel) {
          if (verbose) {
            console.log('Occupancy:', occupancyLevel, '/', restaurant.capacity);
          }
          var occupancyLevels = utils.updateOccupancyLevels(occupancyLevel);
          if (updateContextBroker) {
            // add service path for the restaurant
            if (typeof restaurant.department !== 'undefined' &&
                restaurant.department !== '') {
              fiwareHeaders['fiware-servicepath'] = '/' + restaurant.department;
            }
            utils.sendRequest('PATCH', occupancyLevels,
                              restaurant.id, fiwareHeaders)
              .then(
                function(data) {
                  updateProgressIndicator(callback,null);
                }
              )
              .catch(
                function(err) {
                  updateProgressIndicator(callback,err);
                }
              );
          } else {
            updateProgressIndicator(callback,null);
          }
        }
      )
      .catch(
        function(err) {
          updateProgressIndicator(callback,err);
        }
      );
  }

  function processEnd(err) {
    if (err) {
      console.error(err);
    } else {
      console.log('Done.');
    }
  }

  maxCount = restaurantsData.length;
  async.eachSeries(
    restaurantsData,
    processRestaurant,
    processEnd
  );

}

parseArgs();

utils.getListByType('Restaurant', limitRestaurantName, fiwareHeaders)
  .then(function(data) {
    restaurantsData = utils.objectToArray(
      JSON.parse(JSON.stringify(data.body))
    );
    updateRestaurants();
  })
  .catch(function(err) {
    console.error(err);
  });
