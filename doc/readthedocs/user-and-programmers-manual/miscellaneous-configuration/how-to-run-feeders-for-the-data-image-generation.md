## Feeders, sensors generators and occupancy updater

**Table of Contents**

- [Feeders](#feeders)
	- [restaurantfeeder.js](#restaurantfeeder.js)
	- [reservationsgenerator.js](#reservationsgenerator.js)
	- [reviewsgenerator.js](#reviewsgenerator.js)
- [Sensors generators](#sensors-generators)
	- [sensorsgenerator.js](#sensorsgenerator.js)
	- [sensorsupdater.js](#sensorsupdater.js)
- [Occupancy updater](#occupancy-updater)
	- [occupancyupdater.js](#occupancyupdater.js)

## Feeders

Set of scripts to generate context information to Orion Context Broker.

**Note**: By default the image provided in the [docker-compose.yml](https://raw.githubusercontent.com/Fiware/tutorials.TourGuide-App/develop/docker-compose.yml) has already restaurants, reservations and reviews loaded. The usage of the restaurant feeder is intended for usage in a clean Orion image with any preloaded context data. Reviews and reservations feeders can be used as many times as wanted (they generates one review/reservation for restaurant).

### restaurantfeeder.js

Takes restaurants information from Euskadi Open data, gets geo-location of each using google maps API and parse it to Orion.

#### Usage:

```
node restaurantfeeder.js
```

Or from inside the container:

```
docker exec -i -t <tourguide-container> node tutorials.TourGuide-App/server/feeders/restaurantfeeder.js
```

with `<tourguide-container>` being the `ID` or the `name` of the tourguide container.

### reservationsgenerator.js

Generates random reservations for the restaurants already loaded in Orion.

#### Usage

```
node reservationsgenerator.js
```

Or from inside the container:

```
docker exec -i -t <tourguide-container> node tutorials.TourGuide-App/server/feeders/reservationsgenerator.js
```

### reviewsgenerator.js

Generates random reviews for the restaurants already loaded in Orion.

#### Usage

```
node reviewsgenerator.js
```

Or from inside the container:

```
docker exec -i -t <tourguide-container> node tutorials.TourGuide-App/server/feeders/reviewsgenerator.js
```

## Sensors generators

Set of scripts that generate simulated sensors information.

### sensorsgenerator.js

Generates temperature and humidity sensors for kitchen and dinning room of each Restaurant loaded in Orion.

#### Usage:

```
node sensorsgenerator.js
```

Or from inside the container:

```
docker exec -i -t <tourguide-container> node tutorials.TourGuide-App/server/feeders/sensorsgenerator.js
```

### sensorsupdater.js

Updates the value of the sensors previously generated.

#### Usage:

```
node sensorsupdater.js
```

Or from inside the container:

```
docker exec -i -t <tourguide-container> node tutorials.TourGuide-App/server/feeders/sensorsupdater.js
```

## Occupancy updater

Updates the occupancy context information in Orion of each Restaurant.

### occupancyupdater.js

#### Usage:

```
$ node occupancyupdater.js --help

Usage: occupancyupdater.js <options>

Available options:

  -h  --help                          Show this help.
  -v  --verbose                       Increase logs verbosity.
  -r  --restaurant <name>             Calculate occupancy level for <name> restaurant.
  -i  --interval <seconds>            Set interval for reservations in seconds.
                                      Default is 7200 (2 hours).
  -n  --no-update                     Do not update data on contex broker.
```

Or from inside the container:

```
docker exec -i -t <tourguide-container> node tutorials.TourGuide-App/server/feeders/occupancyupdater.js --help
```
