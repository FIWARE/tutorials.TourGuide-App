# Context Provider example

This document explains the configuration and use of a Context Provider within the scope of Fiware TourGuide.  For a detailed explanation of Context Providers, please read the official documentation for Orion Context Broker available at https://fiware-orion.readthedocs.org/en/develop/user/context_providers/index.html.

In this example we are going to register a Context Provider (CPr) for an entity on our Context Broker (CB) and then query that entity from our CB.  Before doing this we need some information about the CPr and the entity we want to register.  For our example, we are going to use the following information:

* URL of the CPr: http://hackathon.ttcloud.net:10026/v1
* Fiware Service to use: todosincluidos
* Fiware Service Path: /iot
* Entity: YB6PBL
* Entity type: thinkingthing
* Entity attributes: temperature, humidity, luminance

Please note that, at the time of writing, we must use in our CB the same Service and Service Path that the entity has on the CPr and that it uses Orion Context Broker API v1.

## Registering the Context Provider

To register the CPr for an entity we must define the registration via a JSON file, like this:

```json
{
  "contextRegistrations": [
    {
      "entities": [
        {
          "type": "thinkingthing",
          "isPattern": "false",
          "id": "YB6PBL"
        }
      ],
      "attributes": [
        {
          "name": "temperature",
          "type": "",
          "isDomain": "false"
        },
        {
          "name": "humidity",
          "type": "",
          "isDomain": "false"
        },
        {
          "name": "luminance",
          "type": "",
          "isDomain": "false"
        }
      ],
      "providingApplication": "http://hackathon.ttcloud.net:10026/v1"
    }
  ],
  "duration": "P1M"
}
```

Here we have defined the entity we want to register (YB6PBL), the attributes (temperature, humidity and luminance) and the CPr to use (via providingApplication).

To register this on our CB we can use curl like this:

```
curl http://localhost:1026/v1/registry/registerContext -s -S \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--header 'Fiware-Service: todosincluidos' \
--header 'Fiware-ServicePath: /iot' \
-d @registration.json
```

with:

* our CB listening on port 1026 on localhost,
* registration.json being a file with the json we defined earlier

There's a script already available on the TourGuide image with this information ([cpr-registration.sh](https://github.com/Fiware/tutorials.TourGuide-App/blob/master/docker/images/tutorials.tourguide-app/cpr-registration.sh)).  To use it you just need to enable subscriptions (i.e. via ORION_SUBSCRIPTIONS_ENABLED=true on the compose file) or execute it manually inside the container.

After registering the CPr, we shoud get a response like this:

```json
{
  "duration" : "P1M",
  "registrationId" : "5685134680cc797c70ca2aaa"
}
```

## Querying the data

Once we have registrered the entity using a CPr, we can start querying it.  Trying first using Orion Context Broker API v1:

```
curl http://localhost:1026/v1/contextEntities/YB6PBL -s -S \
--header 'Fiware-Service: todosincluidos' \
--header 'Fiware-ServicePath: /iot' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' | python -m json.tool
```

This returns the following JSON:

```json
{
  "contextElement": {
    "attributes": [
      {
        "metadatas": [
          {
            "name": "TimeInstant",
            "type": "ISO8601",
            "value": "2015-11-11T15:09:06.384Z"
          }
        ],
        "name": "humidity",
        "type": "float",
        "value": "30"
      },
      {
        "metadatas": [
          {
            "name": "TimeInstant",
            "type": "ISO8601",
            "value": "2015-11-11T15:09:06.384Z"
          }
        ],
        "name": "luminance",
        "type": "float",
        "value": "37.64"
      },
      {
        "metadatas": [
          {
            "name": "TimeInstant",
            "type": "ISO8601",
            "value": "2015-11-11T15:09:06.384Z"
          }
        ],
        "name": "temperature",
        "type": "float",
        "value": "32.81"
      }
    ],
    "id": "YB6PBL",
    "isPattern": "false",
    "type": "thinkingthing"
  },
  "statusCode": {
    "code": "200",
    "reasonPhrase": "OK"
  }
}
```

We can also try using Orion Context Broker API v2, like this:

```
curl http://localhost:1026/v2/entities/YB6PBL -s -S \
--header 'Fiware-Service: todosincluidos' \
--header 'Fiware-ServicePath: /iot' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' | python -m json.tool
```

This returns the following JSON:

```json
{
  "humidity": {
    "TimeInstant": {
      "type": "ISO8601",
      "value": "2015-11-11T15:09:06.384Z"
    },
    "type": "float",
    "value": "30"
  },
  "id": "YB6PBL",
  "luminance": {
    "TimeInstant": {
      "type": "ISO8601",
      "value": "2015-11-11T15:09:06.384Z"
    },
    "type": "float",
    "value": "37.64"
  },
  "temperature": {
    "TimeInstant": {
      "type": "ISO8601",
      "value": "2015-11-11T15:09:06.384Z"
    },
    "type": "float",
    "value": "32.81"
  },
  "type": "thinkingthing"
}
```
We can also query a single attribute (i.e. temperature) like this, using Orion Context Broker API v1:

```
curl http://localhost:1026/v1/contextEntities/YB6PBL/attributes/temperature -s -S \
--header 'Fiware-Service: todosincluidos' \
--header 'Fiware-ServicePath: /iot' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' | python -m json.tool
```

This returns the following JSON:

```json
{
  "attributes": [
    {
      "metadatas": [
        {
          "name": "TimeInstant",
          "type": "ISO8601",
          "value": "2015-11-11T15:09:06.384Z"
        }
      ],
      "name": "temperature",
      "type": "float",
      "value": "32.81"
    }
  ],
  "statusCode": {
    "code": "200",
    "reasonPhrase": "OK"
  }
}
```

or via Orion Context Broker API v2:

```
curl http://localhost:1026/v2/entities/YB6PBL?attrs=temperature -s -S \
--header 'Fiware-Service: todosincluidos' \
--header 'Fiware-ServicePath: /iot' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' | python -m json.tool
```

This returns the following JSON:

```json
{
  "id": "YB6PBL",
  "temperature": {
    "TimeInstant": {
      "type": "ISO8601",
      "value": "2015-11-11T15:09:06.384Z"
    },
    "type": "float",
    "value": "32.81"
  },
  "type": "thinkingthing"
}
```
