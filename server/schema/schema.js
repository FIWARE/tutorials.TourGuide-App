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
            'items': {
                '@type': 'string',
                'streetAddress': 'string',
                'addressLocality': 'string',
                'addressRegion': 'string',
                'postalCode': 'number'
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
            'items': {
                'type': 'string',
                'name': 'string',
                'value': 'number'
            },
            'minItems': 1,
            'uniqueItems': true
        },
        'occupancyLevels': {
            'type': 'object',
            'items': {
                'type': 'string',
                'timestamp': 'string',
                'name': 'string',
                'value': 'number'
            },
            'minItems': 1,
            'uniqueItems': true
        }
    },
    'required': ['@type', 'name', 'address', 'department', 
    'description', 'priceRange',
    'telephone', 'url', 'capacity', 'occupancyLevels']
};
