/* jshint node: true, nonstandard: true */
/*
 * DevGuide Utils
 */
'use strict';
var http = require('http');
var https = require('https');
var util = require('util');
var shortid = require('shortid');
var authRequest = require('./authrequest');

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
    'Dining_humidity'
  ];

  restaurantSchemaElements.push.apply(restaurantSchemaElements,
                                      additionalProperties);
  var newElement = {
    '@context': 'http://schema.org',
    '@type': element.type
  };

  //-- List elements matching

  // array for sensors
  var additionalProperty = [];

  // -- Element value

  var val;

  Object.keys(element).forEach(function(elementAttribute) {
    
    val = element[elementAttribute];

    if (restaurantSchemaElements.indexOf(elementAttribute) !== -1) {
      if (val !== 'undefined') {
        if (additionalProperties.indexOf(elementAttribute) !== -1) {
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
  newElement.address['@type'] = 'postalAddress';

  // -- Display geo-location schema.org like

  if (element.location &&
      element.location.value &&
      typeof element.location.value === 'string') {
    var geoCoords = element.location.value.split(',');
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
          newElement[elementAttribute] = val;
        }
      }
    });
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
        newElement[elementAttribute] = val;
      }
    }
  });
  newElement.reservationId = unescape(element.id);
  newElement.reservationFor.name = unescape(
    newElement.reservationFor.name);
  newElement.reservationFor.address['@type'] = 'postalAddress';

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
  if (geoObject) {
    if (geoObject.streetName && geoObject.streetNumber) {
      schemaObject.address.streetAddress =
      geoObject.streetName +
      ' ' + geoObject.streetNumber;
    } else if (geoObject.streetName) {
      schemaObject.address.streetAddress = geoObject.streetName;
    }
    if (geoObject.city) {
      schemaObject.address.addressLocality = geoObject.city;
    } else if (geoObject.administrativeLevels.level2long) {
      schemaObject.address.addressLocality =
      geoObject.administrativeLevels
      .level2long;
    }
    if (geoObject.administrativeLevels.level2long) {
      schemaObject.address.addressRegion =
      geoObject.administrativeLevels
      .level2long;
    }
    if (geoObject.zipcode) {
      schemaObject.address.postalCode = geoObject.zipcode;
    }
  }
  return schemaObject;
}

function addGeolocation(schemaObject, geoObject) {
  if (geoObject) {
    schemaObject.location = {};
    schemaObject.location.type = 'geo:point';
    schemaObject.location.crs = 'WGS84';
    schemaObject.location.value = geoObject.latitude + ', ' +
      geoObject.longitude;
  }
  return schemaObject;
}

function restaurantToOrion(schemaObject, geoObject) {

  schemaObject.type = schemaObject['@type'];
  schemaObject.id = schemaObject.name;
  delete schemaObject['@type'];
  delete schemaObject.name;

  schemaObject = addGeolocation(schemaObject, geoObject);
  schemaObject = fixAddress(schemaObject, geoObject);

  return sortObject(schemaObject);

}

function reviewToOrion(schemaObject) {

  // -- TODO: add user from session
  // -- TODO: check how to implement 'position field'
  // -- - idea is, whenever a new review is created into
  // -- - a restaurant, the review position increase;
  // -- - but the only one able to modify it is the user
  // -- - We need that way cause we cannot display 'ids'

  schemaObject.type = schemaObject['@type'];
  var rname = schemaObject.itemReviewed.name;
  rname += '-' + shortid.generate();
  schemaObject.id = rname;
  schemaObject.author = {};
  schemaObject.author['@type'] = 'Person';
  schemaObject.dateCreated = Date.now();
  return sortObject(schemaObject);

}

function reservationToOrion(schemaObject) {

  // -- TODO: add user from session

  schemaObject.type = schemaObject['@type'];
  var rname = schemaObject.reservationFor.name;
  rname += '-' + shortid.generate();
  schemaObject.id = rname;
  schemaObject.underName = {};
  schemaObject.underName['@type'] = 'Person';
  return schemaObject;
}

function getOrgRestaurants(org, listOfElements) {

  var newListOfElements = [];

  listOfElements = objectToArray(listOfElements);

  Object.keys(listOfElements).forEach(function (element, pos) {

    if (listOfElements[pos].department == org) {

      newListOfElements.push(listOfElements[pos]);

    }
  });

  return newListOfElements;
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
  getOrgRestaurants: getOrgRestaurants
};
