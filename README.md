# fiware-devguide-app
[![Build Status][travis-image]][travis-url]
[![License][license-image]][license-url]

**Table of Contents**

- [Overview](#overview)
- [Architecture](#architecture)
- [Installation and usage](#installation-and-usage)
- [REST Interface](#rest-interface)
- [Feedback](#feedback)

## Overview

[FIWARE Developers Guide App](https://github.com/Bitergia/fiware-devguide-app) is a on-going node.js sample application used in the [FIWARE Developers Guide](http://www.fiware.org/tour-guide/) to show real code working with the Generic Enablers integrated.

This application is a smart, context-aware application which allows to manage large Restaurant chains which are operating worldwide. Is intended to both franchise managers and to customers. To this aim, the main functionalities provided by the application are:

* Admit Customer reservations
* Register customer reviews
* Real-time control of different parameters at each restaurant location (temperature and humidity)
* Restaurant geo-location
* Short time historic data of the different parameters monitored
* Publication of open data concerning the most relevant information about the different restaurant locations, grouped by different properties

## Architecture

![Architecture diagram](https://github.com/Bitergia/fiware-devguide-app/blob/master/doc/img/archDiagram.png?raw=true "Architecture diagram")

It includes (for the moment) the following components:

* [Orion Context Broker](http://catalogue.fiware.org/enablers/publishsubscribe-context-broker-orion-context-broker), providing the NGSIv2 interfaces.
* [Backend Device Management - IDAS](http://catalogue.fiware.org/enablers/backend-device-management-idas),  to connect IoT devices (temperature & humidity).
* [Cygnus](https://github.com/telefonicaid/fiware-cygnus) for the [Cosmos ecosystem](http://catalogue.fiware.org/enablers/bigdata-analysis-cosmos) to give persistance to the context data (using its sinks).
* [Authorization PDP - AuthZForce](http://catalogue.fiware.org/enablers/authorization-pdp-authzforce), to get authorization decisions based on authorization policies.
* [PEP Proxy - Wilma](https://github.com/ging/fi-ware-pep-proxy), to add authentication and authorization security to the application.
* [IDM KeyRock](https://github.com/ging/fi-ware-idm), covering the user profile management, authorization and authentication among others.

## Installation and usage

This project integrates a set of Generic Enablers using those enablers inside [docker](https://github.com/docker/docker) containers. It also comes with restaurants, reviews and reservations loaded to start working out of the box, as well as users and organizations to play with it.

For that purpose, [docker](https://github.com/docker/docker) and [docker-compose](https://docs.docker.com/compose/) are required. 

![Compose Diagram](https://github.com/Bitergia/fiware-devguide-app/blob/master/doc/img/composeDiagram.png?raw=true "Compose Diagram")

Detailed information of how to start this environment can be found [here](https://github.com/Bitergia/fiware-devguide-app/tree/master/docker/images/fiware-devguide-app).

## REST Interface

The application provides a RESTful API with different routes and functions that covers the functionalities described above:

* [FIWARE Devguide RESTful API](http://docs.devguide.apiary.io)

## Feedback

Try and tweak the Tour Guide application and if you have any feedback please contact us at http://ask.fiware.org.

[travis-image]: https://travis-ci.org/Bitergia/fiware-devguide-app.svg?branch=master
[travis-url]: https://travis-ci.org/Bitergia/fiware-devguide-app

[license-image]: https://img.shields.io/npm/l/express.svg
[license-url]: https://github.com/Bitergia/fiware-devguide-app/blob/master/LICENSE