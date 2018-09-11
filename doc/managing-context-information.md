# Managing Context Information

In this section the steps needed to run Orion Context Broker and some example operations are detailed. Further information about Orion Context Broker can be found in the [Development of context-aware applications](../development-context-aware-applications/introduction/) section or in the [oficial documentation](http://fiware-orion.readthedocs.io/en/latest/).


For running an Orion instance ready to be used, run:

```
 docker-compose up orion
```

or using the Command Line Interface (CLI):

```
./tour-guide start orion
```

Information regarding restaurants, reviews and reservations is already loaded.

In order to perform a request to the Context Broker we need to know its hostname. You can modify the system hosts file using the CLI provided in the Tour Guide Application by executing `./tour-guide configure hosts`. After executing the configure hosts command, you can perform requests to the context broker using `orion` instead of its IP.

You can check that Orion is running and the hosts file is correctly configured by issuing the following HTTP request:

```
GET orion:1026/version
```

Then, you will obtain a JSON response similar to:

```
{
    "orion" : {
        "version" : "1.3.0",
        "uptime" : "0 d, 0 h, 2 m, 42 s",
        "git_hash" : "cb6813f044607bc01895296223a27e4466ab0913",
        "compile_time" : "Fri Sep 2 08:36:02 UTC 2016",
        "compiled_by" : "root",
        "compiled_in" : "ba19f7d3be65"
    }
}

```


If you want to create a new restaurant, you can issue a request with restaurant information in the payload body and specifying a franchise using the `Fiware-ServicePath` HTTP header.  

For instance, in order to create a restaurant belonging to  `Franchise1` the following HTTP request can be used:

```
POST orion:1026/v2/entities/

Headers:

{
    'Content-Type':        'application/json',
    'Fiware-Service':      'tourguide'
    'Fiware-ServicePath':  '/Franchise1'

}

{
    "id": "sample-id",
    "type": "Restaurant",
    "address": {
        "type": "PostalAddress",
        "value": {
            "streetAddress": "Cuesta de las Cabras Aldapa 2",
            "addressRegion": "Araba",
            "addressLocality": "Alegría-Dulantzi",
            "postalCode": "01240"
        }
    },
    "aggregateRating": {
        "type": "AggregateRating",
        "value": {
            "ratingValue": 3,
            "reviewCount": 98
        }
    },
    "capacity": {
        "type": "PropertyValue",
        "value": 100      
    },
    "department": {
        "type": "Text",
        "value": "Franchise1"            
    },
    "description": {
        "type": "Text",
        "value": "Sample description"            
    },
    "location": {
        "type": "geo:point",
        "value": "42.8404625, -2.5123277"
    },
    "name": {
        "type": "Text",
        "value": "Sample-restaurant"
    },
    "occupancyLevels": {
        "type": "PropertyValue",
        "value": 0,
        "metadata": {
            "timestamp": {
                "type": "DateTime",
                "value": "2016-09-19T06:32:15.901Z"
            }
        }
    },
    "priceRange": {
        "type": "Number",
        "value": 0
    },
    "telephone": {
        "type": "Text",
        "value": "945 400 868"
    }
}

```

Afterwards, you can retrieve the restaurant data just created using its id. The `keyValues` option is used in order to get a more compact and brief representation, including just attribute names and values:


```
GET orion:1026/v2/entities/sample-id?options=keyValues


Headers:


{
    'Content-Type':        'application/json',
    'Fiware-Service':      'tourguide',
    'Fiware-ServicePath':  '/Franchise1'
}

```

You should get:

```
{
    "id": "sample-id",
    "type": "Restaurant",
    "address": {
        "streetAddress": "Cuesta de las Cabras Aldapa 2",
        "addressRegion": "Araba",
        "addressLocality": "Alegría-Dulantzi",
        "postalCode": "01240"
    },
    "aggregateRating": {
        "ratingValue": 3,
        "reviewCount": 98
    },
    "capacity": 100,
    "department": "Franchise1",
    "description": "Sample description",
    "location": "42.8404625, -2.5123277",
    "name": "Sample-restaurant",
    "occupancyLevels": 0,
    "priceRange": 0,
    "telephone": "945 400 868"
}
```


If you need to update restaurant data after refurbishing it, which may imply a change in capacity and description values, you can use the following HTTP request:

```
PATCH  orion:1026/v2/entities/sample-id/attrs?options=keyValues


Headers

{
  'Content-Type':        'application/json',
  'Fiware-Service':      'tourguide'
  'Fiware-ServicePath':  '/Franchise1'
}


{
    "description" : "New sample description",
    "capacity": 150
}
```

You can check that the values have been updated by retrieving the attributes with:

```
GET orion:1026/v2/entities/sample-id/attrs?attrs=description,capacity&options=keyValues

Headers

{
    'Content-Type':        'application/json',
    'Fiware-Service':      'tourguide',
    'Fiware-ServicePath':  '/Franchise1'
}

```

It should return:

```
{
    "description": "New sample description",
    "capacity": 150
}
```
