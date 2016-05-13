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
var crypto = require('crypto');
var shortid = require('shortid');
var authRequest = require('./auth/authrequest');

var RESTAURANT_TYPE = 'Restaurant';
var REVIEW_TYPE = 'Review';
var RESERVATION_TYPE = 'FoodEstablishmentReservation';
var POSTAL_ADDRESS_TYPE = 'PostalAddress';
var PROPERTY_VALUE_TYPE = 'PropertyValue';
var PERSON_TYPE = 'Person';
var ORG_TYPE = 'Organization';
var RATING_TYPE = 'Rating';
var FOOD_ESTABLISHMENT_TYPE = 'FoodEstablishment';
var DATE_TYPE = 'Date';
var AGGREGATE_RATING_TYPE = 'AggregateRating';

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

function restaurantToSchema(element, date) {

  var restaurantSchemaElements = [
    'address',
    'department',
    'description',
    'priceRange',
    'telephone',
    'url'
  ];

  var elementToSchema = {
    '@context': 'http://schema.org',
    '@type': RESTAURANT_TYPE,
    'aggregateRating': {
      'reviewCount': element.aggregateRating.reviewCount,
      'ratingValue': element.aggregateRating.ratingValue
    },
    'additionalProperty': [
      {
        'value': element.capacity,
        'name': 'capacity',
        '@type': PROPERTY_VALUE_TYPE
      },
      {
        'value': element.occupancyLevels,
        'name': 'occupancyLevels',
        '@type': PROPERTY_VALUE_TYPE
      }
    ],
    'name': element.name
  };

  if (date) {
    elementToSchema.additionalProperty[1].timestamp = date;
  } else {
    elementToSchema.additionalProperty[1].timestamp = new Date().toISOString();
  }

  var val;

  Object.keys(element).forEach(function(elementAttribute) {

    val = element[elementAttribute];

    if (restaurantSchemaElements.indexOf(elementAttribute) !== -1) {
      if (val !== 'undefined') {
        if (typeof val === 'string') {
          elementToSchema[elementAttribute] = unescape(val);
        } else {
          elementToSchema[elementAttribute] = val;
        }
      }
    }
  });

  if (elementToSchema.address) {
    elementToSchema.address['@type'] = POSTAL_ADDRESS_TYPE;
  }

  if (element.location) {
    var geoCoords = element.location.split(',');
    elementToSchema.geo = {
      '@type': 'GeoCoordinates',
      'latitude': geoCoords[0],
      'longitude': geoCoords[1]
    };
  }

  return sortObject(elementToSchema);
}

function reviewToSchema(element) {

  var elementToSchema = {
    '@context': 'http://schema.org',
    '@type': REVIEW_TYPE,
    'author': {
      '@type': PERSON_TYPE,
      'name': element.author
    },
    'dateCreated': element.dateCreated,
    'itemReviewed': {
      '@type': RESTAURANT_TYPE,
      'name': element.itemReviewed
    },
    'name': element.id,
    'publisher': {
      '@type': ORG_TYPE,
      'name': element.publisher
    },
    'reviewBody': element.reviewBody,
    'reviewRating': {
      '@type': RATING_TYPE,
      'ratingValue': element.reviewRating
    }
  };

  return sortObject(elementToSchema);
}

function reservationToSchema(element) {

  var elementToSchema = {
      '@context': 'http://schema.org',
      '@type': RESERVATION_TYPE,
      'partySize': element.partySize,
      'reservationFor': {
        '@type': FOOD_ESTABLISHMENT_TYPE,
        'name': element.reservationFor,
        'address': {
          '@type': POSTAL_ADDRESS_TYPE,
          'streetAddress': element.address.streetAddress,
          'addressRegion': element.address.addressRegion,
          'addressLocality': element.address.addressLocality,
          'postalCode': element.address.postalCode,
        }
      },
      'reservationStatus': element.reservationStatus,
      'startTime': element.startTime,
      'underName': {
        '@type': PERSON_TYPE,
        'name': element.underName
      },
      'reservationId': element.id
    };

  return sortObject(elementToSchema);

}

function objectDataToSchema(element, date) {

  var newElement;
  var type = element.type;

  switch (type) {

  case RESTAURANT_TYPE:

    if (date) {
      newElement = restaurantToSchema(element, date);
    } else {
      newElement = restaurantToSchema(element);
    }
    return newElement;

  case REVIEW_TYPE:

    newElement = reviewToSchema(element);
    return newElement;

  case RESERVATION_TYPE:

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

function dataToSchema(listOfElements, date) {

  var newListOfElements = [];
  var newElement;

  listOfElements = objectToArray(listOfElements);

  listOfElements.forEach(function(element) {
    if (date) {
      newElement = objectDataToSchema(element, date);
    } else {
      newElement = objectDataToSchema(element);
    }
    newListOfElements.push(newElement);

  });
  return newListOfElements;
}

/**
 * Completes the schemaObject address element
 *
 * @param {Object} schemaObject - Object to be added in Orion
 * @param {Object} geoObject - geocoder object
 * @return {Object} schemaObject - The schemaObject with the
 *         fixed address
*/
function completeAddress(schemaObject, geoObject) {

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
  if (geoObject) {
    schemaObject.location = {
      'type': 'geo:point',
      'value': geoObject.latitude + ', ' + geoObject.longitude
    };
  }
  return schemaObject;
}

function restaurantToOrion(schemaObject, geoObject) {

  var objectToOrion = {
    'address': {
      'type': POSTAL_ADDRESS_TYPE,
      'value': {
        'streetAddress': schemaObject.address.streetAddress,
        'addressLocality': schemaObject.address.addressLocality,
        'addressRegion': schemaObject.address.addressRegion,
        'postalCode': schemaObject.address.postalCode
      }
    },
    'aggregateRating': {
      'type': AGGREGATE_RATING_TYPE,
      'value': {
        'ratingValue': 0,
        'reviewCount': 0
      }
    },
    'capacity': {
      'type': PROPERTY_VALUE_TYPE,
      'value': schemaObject.capacity.value
    },
    'department': {
      'value': schemaObject.department
    },
    'description': {
      'value': schemaObject.description
    },
    'id': generateId(schemaObject.name),
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
          'type': DATE_TYPE,
          'value': schemaObject.occupancyLevels.metadata.timestamp.value
        }
      },
      'type': PROPERTY_VALUE_TYPE,
      'value': schemaObject.occupancyLevels.value
    },
    'type': RESTAURANT_TYPE,
    'url': {
      'value': schemaObject.url
    },
  };

  objectToOrion = addGeolocation(objectToOrion, geoObject);
  objectToOrion = completeAddress(objectToOrion, geoObject);

  return sortObject(objectToOrion);
}

function reviewToOrion(userObject, schemaObject) {

  if (userObject) {
    var date = new Date().toISOString();
    var itemReviewed = fixedEncodeURIComponent(schemaObject.itemReviewed.name);
    var objectToOrion = {
      'author': {
        'type': PERSON_TYPE,
        'value': userObject.id
      },
      'dateCreated': {
        'type': DATE_TYPE,
        'value': date
      },
      'id': generateId(itemReviewed, date),
      'itemReviewed': {
        'type': RESTAURANT_TYPE,
        'value': itemReviewed
      },
      'publisher': {
        'type': ORG_TYPE,
        'value': userObject.organizations[0].name
      },
      'reviewRating': {
        'type': RATING_TYPE,
        'value': schemaObject.reviewRating.ratingValue
      },
      'reviewBody': {
        'value': fixedEncodeURIComponent(schemaObject.reviewBody)
      },
      'type': REVIEW_TYPE
    };
    return sortObject(objectToOrion);
  }
}

function reservationToOrion(userObject, schemaObject) {

  if (userObject) {
    var date = new Date(schemaObject.startTime).toISOString();
    var reservationFor = fixedEncodeURIComponent(
      schemaObject.reservationFor.name);
    var objectToOrion = {
      'id': generateId(reservationFor, date),
      'partySize': {
        'value': schemaObject.partySize
      },
      'reservationFor': {
        'type': FOOD_ESTABLISHMENT_TYPE,
        'value': reservationFor
      },
      'reservationStatus': {
        'value': 'Confirmed'
      },
      'startTime': {
        'type': DATE_TYPE,
        'value': date
      },
      'address': {
        'type': POSTAL_ADDRESS_TYPE,
        'value': schemaObject.address
      },
      'type': RESERVATION_TYPE,
      'underName': {
        'type': PERSON_TYPE,
        'value': userObject.id
      }
    };
    return sortObject(objectToOrion);
  }
}

function getOrgReservations(listOfRestaurants, listOfReservations) {

  return objectToArray(listOfReservations).filter(
    function(element) {
      return listOfRestaurants.some(function(restaurant) {
        return restaurant.name === element.reservationFor;
      });
    }
  );
}

function getListByType(type, element, headers, queryString, normalized) {
  var uri = '/v2/entities';
  var limit = 1000;
  if (!queryString) {
    queryString = {};
  }
  queryString.type = type;
  queryString.limit = limit;
  if (element) {
    uri += '/' + encodeURIComponent(element);
  }
  if (!normalized) {
    queryString.options = 'keyValues';
  }
  return authRequest(uri, 'GET', null, headers, queryString);
}

function sendRequest(method, body, identifier, headers, queryString) {
  var uri = '/v2/entities';
  if (identifier) {
    uri += '/' + encodeURIComponent(identifier);
  }
  if (method === 'PATCH') {
    uri += '/attrs';
  }
  return authRequest(uri, method, body, headers, queryString);
}

function getAverage(data) {
  var sum = data.reduce(function(sum, value) {
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}

function getAggregateRating(listOfReviews) {

  var counter = 0;
  var ratingValues = [];

  listOfReviews = objectToArray(listOfReviews);

  listOfReviews.forEach(function(element) {

    if (element.reviewRating !== undefined) {

      ratingValues.push(element.reviewRating);
      counter++;
    }
  });

  var newElement = {
    'aggregateRating': {
      'value': {
        'reviewCount': counter,
        'ratingValue': getAverage(ratingValues)
      }
    }
  };

  return newElement;
}

function getTimeframe(isoTimeString) {
  var newDate = new Date(isoTimeString);
  var frame = newDate.getTime() - 60 * 60 * 2 * 1000;
  var frameDateObject = new Date(frame);
  var frameTime = frameDateObject.toISOString() + '..' + newDate.toISOString();
  return frameTime;
}

function getTimeBetweenDates(from, to) {
  var fromTimestamp = new Date(from).toISOString();
  var toTimestamp = new Date(to).toISOString();
  var frameTime = fromTimestamp + '..' + toTimestamp;
  return frameTime;
}

function getOccupancyLevels(listOfReservations) {

  var occupancyLevels = 0;

  listOfReservations.forEach(function(element) {
    occupancyLevels += element.partySize;
  });

  return occupancyLevels;
}

function createOccupancyObject(occupancyLevel, date) {
  var occupancyObject = {
    'occupancyLevels': {
      'metadata': {
        'timestamp': {
          'type': DATE_TYPE,
          'value': date
        }
      },
      'type': PROPERTY_VALUE_TYPE,
      'value': occupancyLevel
    }
  };
  return occupancyObject;
}

function updateOccupancyLevels(listOfReservations, date) {
  var occupancyLevels = getOccupancyLevels(listOfReservations);
  var occupancyLevelsObj = createOccupancyObject(occupancyLevels, date);
  return occupancyLevelsObj;
}

function generateId(name, date) {
  var id;
  var inputEncoding;

  if (date) {
    inputEncoding = name + date;
  } else {
    inputEncoding = name;
  }

  id = crypto.createHash('sha1').update(inputEncoding).digest('hex');
  return id;
}

function addConditionToQuery(listOfConditions, key, operator, value) {
  var condition;

  if (!listOfConditions) {
    listOfConditions = [];
  }

  var finalValue = value;
  if (typeof value === 'string' && key !== 'startTime') {
    finalValue = '\'' + value + '\'';
  }
  condition = key + operator + finalValue;

  listOfConditions.push(condition);
  return listOfConditions;
}

function completeHeaders(headers, department) {
  var fiwareHeaders = JSON.parse(JSON.stringify(headers));
  if (department) {
    fiwareHeaders['fiware-servicepath'] = '/' + department;
  }
  return fiwareHeaders;
}

function removeServicePath(headers) {
  var fiwareHeaders = JSON.parse(JSON.stringify(headers));
  if (typeof fiwareHeaders['fiware-servicepath'] !== 'undefined') {
    delete fiwareHeaders['fiware-servicepath'];
  }
  return fiwareHeaders;
}

function returnResponse(data, res, date) {
  res.statusCode = data.statusCode;
  res.headers = data.headers;
  if (data.body) {
    if (date) {
      res.json(dataToSchema(data.body, date));
    } else {
      res.json(dataToSchema(data.body));
    }
  } else {
    res.end();
  }
}

function responseError(err, res) {
  res.statusCode = err.statusCode;
  res.headers = err.headers;
  if (err.error) {
    res.json(err.error);
  } else if (err.data) {
    res.json(err.data);
  } else {
    res.end();
  }
}

function responsePost(data, element, res) {
  res.headers = data.headers;
  if (element.type === 'Restaurant') {
    res.location('/api/orion/restaurant/' + element.id);
  } else if (element.type === 'Review') {
    res.location('/api/orion/review/' + element.id);
  } else {
    res.location('/api/orion/reservation/' + element.id);
  }
  res.statusCode = data.statusCode;
  res.end();
}

function returnInvalidSchema(res, tv4) {
  res.statusCode = 400;
  res.json({
    error: {
      message: tv4.error.message,
      code: 400,
      params: tv4.error.params,
      dataPath: tv4.error.dataPath,
      title: 'Bad request'
    }
  });
}

function returnForbidden(res) {
  res.statusCode = 403;
  res.json({
    error: {
      message: 'The resource you are trying to access is forbidden',
      code: 403,
      title: 'Forbidden'
    }
  });
}

function returnConflict(res) {
  res.statusCode = 409;
  res.json({
    error: {
      message: 'The ocuppancy levels have reached its limit',
      code: 409,
      title: 'Conflict'
    }
  });
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
  completeAddress: completeAddress,
  addGeolocation: addGeolocation,
  restaurantToOrion: restaurantToOrion,
  reviewToOrion: reviewToOrion,
  reservationToOrion: reservationToOrion,
  getOrgReservations: getOrgReservations,
  getListByType: getListByType,
  sendRequest: sendRequest,
  getAverage: getAverage,
  getAggregateRating: getAggregateRating,
  getTimeframe: getTimeframe,
  getOccupancyLevels: getOccupancyLevels,
  getTimeBetweenDates: getTimeBetweenDates,
  updateOccupancyLevels: updateOccupancyLevels,
  generateId: generateId,
  addConditionToQuery: addConditionToQuery,
  completeHeaders: completeHeaders,
  returnResponse: returnResponse,
  responseError: responseError,
  responsePost: responsePost,
  returnInvalidSchema: returnInvalidSchema,
  removeServicePath: removeServicePath,
  returnForbidden: returnForbidden,
  returnConflict: returnConflict
};
