# server

**Table of Contents**  

- [Folders](#folders)
  - [auth](#auth)
  - [client](#client)
  - [data](#data)
  - [feeders](#feeders)
  - [idas](#idas)
  - [misc](#misc)
  - [public](#public)
  - [routes](#routes)
  - [schema](#schema)
  - [spec](#spec)
- [Files](#files)
  - [.jscsrc](#jscsrc)
  - [.jshintrc](#jshintrc)
  - [app.js](#appjs)
  - [config.js](#configjs)
  - [Gruntfile.js](#gruntfilejs)
  - [package.json](#packagejson)
  - [setup-test-env.sh](#setup-test-envsh)
  - [utils.js](#utilsjs)

## Folders

### auth

Contains the files with the functions needed to interact with [Keyrock](http://catalogue.fiware.org/enablers/identity-management-keyrock) and its [Oauth2 Authentication flow](http://fiware-idm.readthedocs.io/en/latest/oauth2.html#oauth2-authentication). See more [inside](auth/README.md).

### client

Symlink to the client side.

### data

Contains the Open Data restaurants file provided by the [Basque Government](http://opendata.euskadi.eus/catalogo/-/restaurantes-asadores-sidrerias-bodegas-y-bares-de-pintxos-de-euskadi/), to use with the [restaurant feeder](feeders/README.md) to fill the restaurant-data [image](https://hub.docker.com/r/fiware/tutorials.tourguide-app.restaurant-data/).

### feeders

Set of tools to generate restaurants, reviews and reservations using the dataset mentioned below. You can see further instructions regarding it's usage [inside the folder](feeders/README.md).

### idas

`ul20.js` contains the [ultralight 2.0](https://github.com/telefonicaid/fiware-IoTAgent-Cplusplus/blob/release/1.0.2/doc/UL20_protocol.md) functions needed to generate new Sensors and update them in [IDAS](http://catalogue.fiware.org/enablers/backend-device-management-idas).

### misc

Contains a simple node.js script that allows to retrieve a Oauth `token` using the [Resource Owner Credentials Grant](http://fiware-idm.readthedocs.io/en/latest/oauth2.html#resource-owner-password-credentials-grant) from [Keyrock](http://catalogue.fiware.org/enablers/identity-management-keyrock). See it's [usage](misc/README.md).

### public

This folder is usually intended for static files only, but in our case, the application is served by [Apache server](https://httpd.apache.org/), as it is much better than Node in serving static files.

### routes

Defines the application routes and the logic to interact with [Orion](http://catalogue.fiware.org/enablers/publishsubscribe-context-broker-orion-context-broker). `orion.js` is the file containing the functions that interacts with the Context Broker. Also, the methods and functions will handle the data received through the server API. This includes not only the methods for creating, reading, updating and deleting items, but also any additional logic.

### schema

`schema.js` contains the schema types definitions to validate restaurants, reviews and reservations entities.  

### spec

[jasmine](http://jasmine.github.io/) based end to end tests. See more [inside](spec/README.md).

## Files

### .jscsrc

[JSCS](http://jscs.info/) is a code style linter and formatter for your style guide. This file contains the preset and configuration selected for this project.

### .jshintrc

Another [code style linter](http://jshint.com/). Includes ES6 support.

### app.js

`app.js` is the starting point of the application. It loads everything and begins serving user requests.

### config.js

Simple template that allow us to configure several parameters for the GEris integration.

### Gruntfile.js

[Grunt task runner](http://gruntjs.com/) configuration file. It contains a set of tasks to automate and perform repetitive tasks like linting or testing.

### package.json

Provides information to [npm](https://www.npmjs.com/) that allows to identify the project as well as handle the project's dependencies.

### setup-test-env.sh

Script that launches a testing scenario and run the tests. In case of failure, it dumps the docker logs to the standard output.

### utils.js

`utils.js` contains a large set of functions to handle input and output data, as well as the logic needed.
