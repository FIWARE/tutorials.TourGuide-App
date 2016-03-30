/*
 * utils.js
 * Copyright(c) 2016 Bitergia
 * Author: Bitergia <fiware-testing@bitergia.com>
 * MIT Licensed
 *
 * Tourguide Utils methods
 *
 */

// jshint node: true, nonstandard: true

'use strict';

var http = require('http');
var https = require('https');
var util = require('util');
var shortid = require('shortid');
var authRequest = require('./auth/authrequest');

function doGet(options, callback, res, useHttps) {
  var protocol = http;
  if (useHttps) {
    protocol = https;
  }

  var request = protocol.get(options, function(response) {
    // data is streamed in chunks from the server
    // so we have to handle the "data" event
    var buffer = '';
    var data;

    response.on('data', function(chunk) {
      buffer += chunk;
    });

    response.on('end', function() {
      var msg = '';
      try {
        data = JSON.parse(buffer);
        // console.log(data);
      } catch (err) {
        console.log('Can\'t decode JSON response.');
        console.log(err);
        msg = 'Can\'t decode JSON response.';
      }
      if (data === undefined) {
        msg = 'Error processing JSON response';
      } else {
        msg = buffer;
      }
      callback(res, msg);
    });
  });
  request.on('error', function(err) {
    console.log('FAILED GET REQUEST');
    err = new Error();
    err.status = 502; // Bad gateway
    callback(res, err);
    console.log(err);
  });
}

function doPost(options, data, callback, res, useHttps) {

  try {
    var protocol = http;
    if (useHttps) {
      protocol = https;
    }

    var postReq = protocol.request(options, function(response) {
      // console.log("DOING POST");

      response.setEncoding('utf8');

      var buffer = '';

      response.on('data', function(chunk) {
        buffer += chunk;

      });

      response.on('end', function() {
        // console.log(buffer);
        callback(res, buffer, response.headers);
      });
    });

    // console.log("POST Request created");

    postReq.on('error', function(e) {
      // TODO: handle error.
      callback(res, e);
      console.log(e);
    });

    // post the data
    postReq.write(data);
    postReq.end();

  } catch (error) {
    callback(res, error);
    console.log(error);
  }
}

function replaceOnceUsingDictionary(dictionary, content,
  replacehandler) {
  if (typeof replacehandler !== 'function') {
    // Default replacehandler function.
    replacehandler = function(key, dictionary) {
      return dictionary[key];
    };
  }

  var patterns = []; // \b is used to mark boundaries "foo" doesn't match food
  var patternHash = {};
  var oldkey;
  var key;
  var index = 0;
  var output = [];
  for (key in dictionary) {
    // Case-insensitivity:
    key = (oldkey = key).toLowerCase();
    dictionary[key] = dictionary[oldkey];

    // Sanitize the key, and push it in the list
    patterns.push('\\b(?:' + key.replace(/([[^$.|?*+(){}])/g,
        '\\$1') +
      ')\\b');

    // Add entry to hash variable,
    // for an optimized backtracking at the next loop
    patternHash[key] = index++;
  }
  var pattern = new RegExp(patterns.join('|'), 'gi');
  var lastIndex = 0;

  // We should actually test using !== null, but for foolproofness,
  //  we also reject empty strings

  while (!!(key = pattern.exec(content))) {
    // Case-insensitivity
    key = key[0].toLowerCase();

    // Add to output buffer
    output.push(content.substring(lastIndex, pattern.lastIndex -
      key.length));
    // The next line is the actual replacement method
    output.push(replacehandler(key, dictionary));

    // Update lastIndex variable
    lastIndex = pattern.lastIndex;

    // Don't match again by removing the matched word, create new pattern
    patterns[patternHash[key]] = '^';
    pattern = new RegExp(patterns.join('|'), 'gi');

    // IMPORTANT: Update lastIndex property. Otherwise, enjoy an infinite loop
    pattern.lastIndex = lastIndex;
  }
  output.push(content.substring(lastIndex, content.length));
  return output.join('');
}

function randomIntInc(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low);
}

function randomElement(elements) {
  return elements[Math.floor(Math.random() * elements.length)];
}

function fixedEncodeURIComponent(str) {
  str = str.replace(/["]/g, '\\"');
  str = str.replace(/\n/g, '\\n');
  return str.replace(/[<>"'=;()\n\\]/g, function(c) {
    var hex;
    hex = c.charCodeAt(0).toString(16);
    return '%' + ((hex.length === 2) ? hex : '0' + hex);
  });
}

function getRandomDate(from, to) {
  if (!from) {
    from = new Date(2015, 10, 1).getTime();
  } else {
    from = from.getTime();
  }
  if (!to) {
    to = new Date(2015, 10, 25).getTime();
  } else {
    to = to.getTime();
  }
  return new Date(from + Math.random() * (to - from));
}

function convertHtmlToText(str) {

  //-- remove BR tags and replace them with line break
  str = str.replace(/<br>/gi, '\n');
  str = str.replace(/<br\s\/>/gi, '\n');
  str = str.replace(/<br\/>/gi, '\n');

  //-- remove P and A tags but preserve what's inside of them
  str = str.replace(/<p.*>/gi, '\n');
  str = str.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, ' $2 ($1)');

  //-- remove all inside SCRIPT and STYLE tags
  str = str.replace(
    /<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi, '');
  str = str.replace(/<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi,
    '');
  //-- remove all else
  str = str.replace(/<(?:.|\s)*?>/g, '');

  //-- get rid of more than 2 multiple line breaks:
  str = str.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, '\n\n');

  //-- get rid of more than 2 spaces:
  str = str.replace(/ +(?= )/g, '');

  //-- return
  return str;
}

function objectToArray(element) {

  if (util.isArray(element) === false) {

    var aux = element;
    element = [];
    element.push(aux);
  }
  return element;
}

function restaurantToSchema(element) {

  //-- List elements matching
  var restaurantSchemaElements = [
    'address',
    'aggregateRating',
    'name',
    'department',
    'description',
    'priceRange',
    'telephone',
    'url'
  ];

  // sensors data
  var additionalProperties = [
    'Kitchen_temperature',
    'Kitchen_humidity',
    'Dining_temperature',
    'Dining_humidity',
    'occupancyLevels',
    'capacity'
  ];

  restaurantSchemaElements.push.apply(restaurantSchemaElements,
                                      additionalProperties);
  var newElement = {
    '@context': 'http://schema.org',
    '@type': element.type
  };

  // array for sensors
  var additionalProperty = [];

  // -- Element value
  var val;

  Object.keys(element).forEach(function(elementAttribute) {

    val = element[elementAttribute];

    if (restaurantSchemaElements.indexOf(elementAttribute) !== -1) {
      if (val !== 'undefined') {
        if (additionalProperties.indexOf(elementAttribute) !== -1) {
          if (val.timestamp) {
            var newDate = new Date(val.timestamp).toISOString();
            val.timestamp = newDate;
          }
          additionalProperty.push(val);
        } else {
          if (typeof val === 'string') {
            newElement[elementAttribute] = unescape(val);
          } else {
            newElement[elementAttribute] = val;
          }
        }
      }
    }
  });

  if (additionalProperty.length) {
    newElement.additionalProperty = additionalProperty;
  }

  newElement.name = unescape(element.id);

  newElement = replaceTypeForSchema(newElement);

  // -- Display geo-location schema.org like

  if (element.position &&
      element.position.value &&
      typeof element.position.value === 'string') {
    var geoCoords = element.position.value.split(',');
    newElement.geo = {};
    newElement.geo['@type'] = 'GeoCoordinates';
    newElement.geo.latitude = geoCoords[0];
    newElement.geo.longitude = geoCoords[1];
  }
  return newElement;
}

function reviewToSchema(element) {

  var reviewSchemaElements = [
    'itemReviewed',
    'reviewRating',
    'name',
    'author',
    'reviewBody',
    'publisher',
    'dateCreated'
  ];

  var newElement = {
    '@context': 'http://schema.org',
    '@type': element.type
  };

  var val;

  Object.keys(element).forEach(function(elementAttribute) {
      val = element[elementAttribute];
      if (reviewSchemaElements.indexOf(elementAttribute) !== -1) {
        if (val !== 'undefined') {
          if (typeof val === 'string') {
            newElement[elementAttribute] = unescape(val);
          } else {
            newElement[elementAttribute] = val;
          }
        }
      }
    });

  var newDate = new Date(newElement.dateCreated).toISOString();
  newElement.dateCreated = newDate;
  newElement.name = unescape(element.id);
  newElement = replaceTypeForSchema(newElement);

  return newElement;
}

function reservationToSchema(element) {

  var reservationSchemaElements = [
    'reservationStatus',
    'underName',
    'reservationFor',
    'startTime',
    'partySize'
  ];

  var newElement = {
    '@context': 'http://schema.org',
    '@type': element.type
  };

  var val;

  Object.keys(element).forEach(function(elementAttribute) {
    val = element[elementAttribute];
    if (reservationSchemaElements.indexOf(elementAttribute) !==
      -1) {
      if (val !== 'undefined') {
        if (typeof val === 'string') {
          newElement[elementAttribute] = unescape(val);
        } else {
          newElement[elementAttribute] = val;
        }
      }
    }
  });
  var newDate = new Date(newElement.startTime).toISOString();
  newElement.startTime = newDate;
  newElement.reservationId = unescape(element.id);
  newElement.reservationFor.name = unescape(
    newElement.reservationFor.name);

  newElement = replaceTypeForSchema(newElement);

  return newElement;
}

function objectDataToSchema(element) {

  var newElement;
  var type = element.type;

  switch (type) {

  case 'Restaurant':

    newElement = restaurantToSchema(element);
    return newElement;

  case 'Review':

    newElement = reviewToSchema(element);
    return newElement;

  case 'FoodEstablishmentReservation':

    newElement = reservationToSchema(element);
    return newElement;

  default:
    console.log('Undefined type received to convert');

  }
}

function sortObject(element) {
  var sorted = {};
  var key;
  var aux = [];

  for (key in element) {
    if (element.hasOwnProperty(key)) {
      aux.push(key);
    }
  }

  aux.sort();

  for (key = 0; key < aux.length; key++) {
    sorted[aux[key]] = element[aux[key]];
  }
  return sorted;
}

function dataToSchema(listOfElements) {

  var newListOfElements = [];
  var newElement;

  listOfElements = objectToArray(listOfElements);

  Object.keys(listOfElements).forEach(function(element, pos) {

    newElement = objectDataToSchema(listOfElements[pos]);
    newListOfElements.push(newElement);

  });

  return newListOfElements;
}

function fixAddress(schemaObject, geoObject) {
  // The returned object will be POST/PATCH(ed),
  // so we need to add the 'value' field
  if (geoObject) {
    if (geoObject.streetName && geoObject.streetNumber) {
      schemaObject.address.value.streetAddress =
      geoObject.streetName +
      ' ' + geoObject.streetNumber;
    } else if (geoObject.streetName) {
      schemaObject.address.value.streetAddress = geoObject.streetName;
    }
    if (geoObject.city) {
      schemaObject.address.value.addressLocality = geoObject.city;
    } else if (geoObject.administrativeLevels.level2long) {
      schemaObject.address.value.addressLocality =
      geoObject.administrativeLevels
      .level2long;
    }
    if (geoObject.administrativeLevels.level2long) {
      schemaObject.address.value.addressRegion =
      geoObject.administrativeLevels
      .level2long;
    }
    if (geoObject.zipcode) {
      schemaObject.address.value.postalCode = geoObject.zipcode;
    }
  }
  return schemaObject;
}

function addGeolocation(schemaObject, geoObject) {
  // The returned object will be POST/PATCH(ed),
  // so we need to add the 'value' field
  if (geoObject) {
    schemaObject.location = {};
    schemaObject.location.type = 'geo:point';
    schemaObject.location.value = geoObject.latitude + ', ' +
      geoObject.longitude;
  }
  return schemaObject;
}

function restaurantToOrion(schemaObject, geoObject) {

  var objectToOrion = {
    'address': {
      'type': 'PostalAddress',
      'value': {
        'streetAddress': schemaObject.address.streetAddress,
        'addressLocality': schemaObject.address.addressLocality,
        'addressRegion':schemaObject.address.addressRegion,
        'postalCode': schemaObject.address.postalCode
      }
    },
    'aggregateRating': {
      'type': 'AggregateRating',
      'value': {
        'ratingValue': 0,
        'reviewCount': 0
      }
    },
    'capacity': {
      'type': 'PropertyValue',
      'value': schemaObject.capacity.value
    },
    'department': {
      'value': schemaObject.department
    },
    'description': {
      'value': schemaObject.description
    },
    'id': asciiEncode(stripForbiddenChars(schemaObject.name)),
    'name': {
      'value': fixedEncodeURIComponent(schemaObject.name)
    },
    'priceRange': {
      'value': schemaObject.priceRange
    },
    'telephone': {
      'value': schemaObject.telephone
    },
    'occupancyLevels': {
      'metadata': {
        'timestamp': {
          'type': 'date',
          'value': schemaObject.occupancyLevels.metadata.timestamp.value
        }
      },
      'type': 'PropertyValue',
      'value': schemaObject.occupancyLevels.value
    },
    'type': 'Restaurant',
    'url': {
      'value': schemaObject.url
    },
  };

  objectToOrion = addGeolocation(objectToOrion, geoObject);
  objectToOrion = fixAddress(objectToOrion, geoObject);

  return sortObject(objectToOrion);
}

function reviewToOrion(userObject, schemaObject) {

  if (userObject) {
    var reviewId = schemaObject.itemReviewed.name += '-' + shortid.generate();
    var objectToOrion = {
      'author': {
        'type': 'Person',
        'value': userObject.id
      },
      'dateCreated': {
        'type': 'date',
        'value': new Date().toISOString()
      },
      'id': asciiEncode(reviewId),
      'itemReviewed': {
        'type': 'Restaurant',
        'value': fixedEncodeURIComponent(schemaObject.itemReviewed.name)
      },
      'publisher': {
        'type': 'Organization',
        'value': userObject.organizations[0].name
      },
      'reviewRating': {
        'type': 'Rating',
        'value': schemaObject.reviewRating.ratingValue
      },
      'reviewBody': {
        'value': fixedEncodeURIComponent(schemaObject.reviewBody)
      },
      'type': 'Review'
    };
  }
  return sortObject(schemaObject);
}

function reservationToOrion(userObject, schemaObject) {

  if (userObject) {
    var reservationId = schemaObject.reservationFor.name += '-' + shortid.generate();
    var objectToOrion = {
      'id': asciiEncode(reservationId),
      'partySize': {
        'value': schemaObject.partySize
      },
      'reservationFor': {
        'type': 'FoodEstablishment',
        'value': fixedEncodeURIComponent(schemaObject.reservationFor.name)
      },
      'reservationStatus': {
        'value': 'Confirmed'
      },
      'startTime': {
        'type': 'date',
        'value': getRandomDate().toISOString()
      },
      'type': 'FoodEstablishmentReservation',
      'underName': {
        'type': 'Person',
        'value': userObject.id
      }
    };
  }
  return sortObject(schemaObject);
}

// filter restaurants by organization
function getOrgRestaurants(org, listOfElements) {
  return objectToArray(listOfElements).filter(
    function(element) {
      return element.department === org;
    }
  );
}

// filter reviews by author
function getUserReviews(user, listOfElements) {
  return objectToArray(listOfElements).filter(
    function(element) {
      return element.author.name === user;
    }
  );
}

// filter reviews by restaurant
function getRestaurantReviews(restaurant, listOfElements) {
  return objectToArray(listOfElements).filter(
    function(element) {
      return element.itemReviewed === restaurant;
    }
  );
}

// filter reviews by organization
function getOrgReviews(franchise, listOfRestaurants, listOfReviews) {
  // list of restaurants of the franchise
  listOfRestaurants = getOrgRestaurants(franchise,listOfRestaurants);

  // filter reviews of the restaurants of the franchise
  return objectToArray(listOfReviews).filter(
    function(element) {
      return listOfRestaurants.some(function(restaurant) {
        return restaurant.id === element.itemReviewed.name;
      });
    }
  );
}

// filter list of reservations by user
function getUserReservations(user, listOfElements) {
  return objectToArray(listOfElements).filter(
    function(element) {
      return element.underName.name === user;
    }
  );
}

// filter list of reservations by restaurant name
function getRestaurantReservations(restaurant, listOfElements) {
  return objectToArray(listOfElements).filter(
    function(element) {
      return element.reservationFor.name === restaurant;
    }
  );
}

function getOrgReservations(franchise, listOfRestaurants, listOfReservations) {
  // list of restaurants of the franchise
  listOfRestaurants = getOrgRestaurants(franchise,listOfRestaurants);

  // filter reservations of the restaurants of the franchise
  return objectToArray(listOfReservations).filter(
    function(element) {
      return listOfRestaurants.some(function(restaurant) {
        return restaurant.id === element.reservationFor.name;
      });
    }
  );
}

function getListByType(type, element, headers, raw) {
  var uri = '/v2/entities';
  var options = {'type': type,'limit': '1000'};
  if (element) {
    uri += '/' + encodeURIComponent(element);
  }

  if (typeof raw === 'undefined') {
    options.options = 'keyValues';
  }
  return authRequest(
    uri,
    'GET',
    options,
    headers
  );
}

function sendRequest(method, body, identifier, headers, payload) {
  var uri = '/v2/entities';
  if (identifier) {
    uri += '/' + encodeURIComponent(identifier);
  }
  if (typeof payload === 'undefined') {
    return authRequest(
      uri,
      method,
      body,
      headers
    );
  } else {
    return authRequest(
      uri,
      method,
      body,
      headers,
      payload
    );
  }
}

function getAverage(data) {
  var sum = data.reduce(function(sum, value) {
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}

function getAggregateRating(listOfReviews) {
  // The returned object will be POST/PATCH(ed),
  // so we need to add the 'value' field
  var counter = 0;
  var ratingValues = [];
  var newElement = {
    'aggregateRating': {
      'value': {}
    }
  };

  listOfReviews = objectToArray(listOfReviews);

  Object.keys(listOfReviews).forEach(function(element, pos) {

    if (listOfReviews[pos].reviewRating !== undefined) {

      ratingValues.push(listOfReviews[pos].reviewRating);
      counter++;
    }
  });

  newElement.aggregateRating.value.reviewCount = counter;
  newElement.aggregateRating.value.ratingValue = getAverage(ratingValues);

  return newElement;
}

function replaceTypeForOrion(schemaObject) {
  var parsed = JSON.parse(JSON.stringify(schemaObject), function(key, value) {
    if (key === '@type') {
      this.type = value;
    } else {
      return value;
    }
  });
  return parsed;
}

function replaceTypeForSchema(element) {
  var parsed = JSON.parse(JSON.stringify(element), function(key, value) {
    if (key === 'type') {
      this['@type'] = value;
    } else {
      return value;
    }
  });
  return parsed;
}

function getTimeframe(isoTimeString) {
  var newDate = new Date(isoTimeString).getTime();
  var frame = newDate - 60 * 60 * 2 * 1000;
  var frameTime = 'startTime==' + frame + '..' + newDate;
  return frameTime;
}

function getOccupancyLevels(listOfReservations, restaurant) {

  var occupancyLevels = 0;

  Object.keys(listOfReservations).forEach(function(element, pos) {

    if (listOfReservations[pos].reservationFor.name == restaurant &&
        listOfReservations[pos].reservationStatus == 'Confirmed') {
      occupancyLevels += listOfReservations[pos].partySize;
    }
  });

  return occupancyLevels;
}

function getTimeBetweenDates(from, to) {
  var fromTimestamp = new Date(from).getTime();
  var toTimestamp = new Date(to).getTime();
  var frameTime = 'startTime==' + fromTimestamp + '..' + toTimestamp;
  return frameTime;
}

function updateOccupancyLevels(occupancyLevel, date) {
  return {
    'occupancyLevels': {
      'metadata': {
        'timestamp': {
          'type': 'date',
          'value': date
        }
      },
      'type': 'PropertyValue',
      'value': occupancyLevel
    }
  };
}

function asciiEncode(string) {

  var escapable = /[\\\"\x00-\x1f\x7f-\uffff]/g;
  var meta = { // table of character substitutions
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"': '\\"',
    '\\': '\\\\'
  };

  escapable.lastIndex = 0;
  return escapable.test(string) ?
  string.replace(escapable, function(a) {
    var c = meta[a];
    return typeof c === 'string' ? c :
    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
  }) : string ;
}

function stripForbiddenChars(str) {
  str = str.replace(/[<>"'=;()\s]/g, '_');
  return str;
}

module.exports = {
  doGet: doGet,
  doPost: doPost,
  replaceOnceUsingDictionary: replaceOnceUsingDictionary,
  randomIntInc: randomIntInc,
  randomElement: randomElement,
  fixedEncodeURIComponent: fixedEncodeURIComponent,
  getRandomDate: getRandomDate,
  convertHtmlToText: convertHtmlToText,
  objectToArray: objectToArray,
  restaurantToSchema: restaurantToSchema,
  reviewToSchema: reviewToSchema,
  reservationToSchema: reservationToSchema,
  objectDataToSchema: objectDataToSchema,
  sortObject: sortObject,
  dataToSchema: dataToSchema,
  fixAddress: fixAddress,
  addGeolocation: addGeolocation,
  restaurantToOrion: restaurantToOrion,
  reviewToOrion: reviewToOrion,
  reservationToOrion: reservationToOrion,
  getOrgRestaurants: getOrgRestaurants,
  getUserReviews: getUserReviews,
  getRestaurantReviews: getRestaurantReviews,
  getOrgReviews: getOrgReviews,
  getUserReservations: getUserReservations,
  getRestaurantReservations: getRestaurantReservations,
  getOrgReservations: getOrgReservations,
  getListByType: getListByType,
  sendRequest: sendRequest,
  getAverage: getAverage,
  getAggregateRating: getAggregateRating,
  replaceTypeForOrion: replaceTypeForOrion,
  replaceTypeForSchema: replaceTypeForSchema,
  getTimeframe: getTimeframe,
  getOccupancyLevels: getOccupancyLevels,
  getTimeBetweenDates: getTimeBetweenDates,
  updateOccupancyLevels: updateOccupancyLevels,
  asciiEncode: asciiEncode,
  stripForbiddenChars: stripForbiddenChars
};
