/*
 * schema.js
 * Copyright(c) 2016 Bitergia
 * Author: Bitergia <fiware-testing@bitergia.com>
 * MIT Licensed
 *
 * Schema types definition
 *
 */

// jshint node: true
module.exports.restaurant = {
    '$schema': 'http://json-schema.org/draft-04/schema#',
    'title': 'Restaurant',
    'description': 'A restaurant model',
    'type': 'object',
    'properties': {
        '@type': {
            'description': 'Type of the restaurant',
            'type': 'string'
        },
        'name': {
            'description': 'Name of the restaurant',
            'type': 'string'
        },
        'address': {
            'type': 'object',
            'properties': {
                '@type': {
                  'type': 'string'
                },
                'streetAddress': {
                  'type': 'string'
                },
                'addressLocality': {
                  'type': 'string'
                },
                'addressRegion': {
                  'type': 'string'
                },
                'postalCode': {
                  'type': 'number'
                }
            },
            'minItems': 1,
            'uniqueItems': true
        },
        'department': {
            'type': 'string'
        },
        'description': {
            'type': 'string'
        },
        'priceRange': {
            'type': 'number',
            'minimum': 0,
            'exclusiveMinimum': true
        },
        'telephone': {
            'type': 'string'
        },
        'url': {
            'type': 'string'
        },
        'capacity': {
            'type': 'object',
            'properties': {
                'type': {
                  'type': 'string'
                },
                'name': {
                  'type': 'string'
                },
                'value': {
                  'type': 'number'
                }
            },
            'minItems': 1,
            'uniqueItems': true
        },
        'occupancyLevels': {
            'type': 'object',
            'properties': {
                'type': {
                  'type': 'string'
                },
                'timestamp': {
                  'type': 'string'
                },
                'name': {
                  'type': 'string'
                },
                'value': {
                  'type': 'number'
                }
            },
            'minItems': 1,
            'uniqueItems': true
        }
    },
    'required': ['@type', 'name', 'address', 'department',
    'description', 'priceRange',
    'telephone', 'url', 'capacity', 'occupancyLevels']
};

module.exports.reservation = {
    '$schema': 'http://json-schema.org/draft-04/schema#',
    'title': 'Reservation',
    'description': 'A reservation model',
    'type': 'object',
    'properties': {
        '@type': {
            'description': 'Type of the reservation',
            'type': 'string'
        },
        'partySize': {
            'type': 'number'
        },
        'startTime': {
            'type': 'string'
        },
        'reservationFor': {
            'type': 'object',
            'properties': {
                '@type': {
                  'type': 'string'
                },
                'name': {
                  'type': 'string'
                }
            },
            'minItems': 1,
            'uniqueItems': true
        }
    },
    'required': ['@type', 'partySize', 'startTime', 'reservationFor']
};

module.exports.review = {
    '$schema': 'http://json-schema.org/draft-04/schema#',
    'title': 'Review',
    'description': 'A review model',
    'type': 'object',
    'properties': {
        '@type': {
            'description': 'Type of the review',
            'type': 'string'
        },
        'itemReviewed': {
            'type': 'object',
            'properties': {
                '@type': {
                  'type': 'string'
                },
                'name': {
                  'type': 'string'
                }
            },
            'minItems': 1,
            'uniqueItems': true
        },
        'reviewRating': {
            'type': 'object',
            'properties': {
                '@type': {
                  'type': 'string'
                },
                'ratingValue': {
                  'type': 'number'
                }
            },
            'minItems': 1,
            'uniqueItems': true
        },
        'reviewBody': {
            'type': 'string'
        }
    },
    'required': ['@type', 'itemReviewed', 'reviewRating', 'reviewBody']
};
