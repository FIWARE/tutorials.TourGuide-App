## Feeders, sensors generators and occupancy updater

**Table of Contents**

- [Feeders](#feeders)
	- [restaurantfeeder.js](#restaurantfeeder.js)
	- [restaurantGeocoder.js](#restaurantGeocoder.js)
	- [reservationsgenerator.js](#reservationsgenerator.js)
	- [reviewsgenerator.js](#reviewsgenerator.js)
- [Sensors generators](#sensors-generators)
	- [sensorsgenerator.js](#sensorsgenerator.js)
	- [sensorsupdater.js](#sensorsupdater.js)

## Feeders

Set of scripts to generate context information to Orion Context Broker.

**Note**: By default the image provided in the [docker-compose.yml](https://raw.githubusercontent.com/Fiware/tutorials.TourGuide-App/develop/docker-compose.yml) has already restaurants, reservations and reviews loaded. The usage of the restaurant feeder is intended for usage in a clean Orion image with any preloaded context data. Reviews and reservations feeders can be used as many times as wanted (they generates one review/reservation for restaurant).

### restaurantfeeder.js

Takes restaurants information from Euskadi Open data, gets geo-location of each using google maps API and parse it to Orion.

#### Usage:

```
$ node restaurantfeeder.js --help

Generate restaurants based in Open Euskadi JSON and load it into Orion Context Broker.

Usage: restaurantfeeder.js <options>

Available options:

  -h  --help                          Show this help.
  -f  --jsonfile                      Use a different JSON data from Open Euskadi.
                                      (Feeder expects the same format).
                                      It use by default the one provided in
                                      'server/data/restaurants.json'.
  -g  --geofile                       Use a different JSON data for restaurant Geolocation.
                                      It use by default the one provided in
                                      'server/data/restaurantsGeo.json' (retrieved with Google).
  -r  --restaurant                    Load a single restaurant of the JSON provided using its name.
  -n  --numberOfRestaurants           Load a defined number of restaurants among the
                                      provided ones (can't be used with the previous option).

```

Or from inside the container:

```
$ docker exec -i -t <tourguide-container> node tutorials.TourGuide-App/server/feeders/restaurantfeeder.js --help
```

with `<tourguide-container>` being the `ID` or the `name` of the tourguide container.

### restaurantGeocoder.js

Generate geocoding objects for the Open Euskadi set of restaurants.

#### Usage:
```
Generate geocoding objects for the Open Euskadi set of restaurants.

Usage: restaurantGeocoder.js <options>

Available options:

  -h  --help                          Show this help.
  -f  --jsonfile                      Use a different JSON data from Open Euskadi.
                                      It use by default the provided one in
                                      'server/data/restaurants.json'.
  -o  --output                        File where to store the geocoding data.
                                      It will be stored by default at
                                      'server/data/restaurantsGeo.json'.

```

Or from inside the container:

```
$ docker exec -i -t <tourguide-container> node tutorials.TourGuide-App/server/feeders/restaurantGeocoder.js --help
```

with `<tourguide-container>` being the `ID` or the `name` of the tourguide container.

### reservationsgenerator.js

Generates random reservations for the restaurants already loaded in Orion.

#### Usage

```
node reservationsgenerator.js --help

Generate random reservations of restaurant/s between the provided dates.

Usage: reservationsgenerator.js <options>

Available options:

  -h  --help                          Show this help.
  -s  --fromDate                      Select a date to start (ISO8601 format).
  -e  --toDate                        Select an end date (ISO8601 format).
  -r  --restaurant                    Load reservations for the restaurant of the JSON provided
                                      using its name. Without this value, it will generate
                                      reservations for all the restaurants loaded.
  -n  --numberOfReservations          Load a defined number of reservations (for each restaurant)
                                      among the provided ones.

NOTE: restaurants must be previously loaded to generate reservations. 

```

Or from inside the container:

```
docker exec -i -t <tourguide-container> node tutorials.TourGuide-App/server/feeders/reservationsgenerator.js --help
```

### reviewsgenerator.js

Generates random reviews for the restaurants already loaded in Orion.

#### Usage

```
node reviewsgenerator.js --help

Generate random reviews for the restaurant/s loaded.

Usage: reviewsgenerator.js <options>

Available options:

  -h  --help                          Show this help.
  -o  --organization                  Load reviews for all the restaurants of the given organization.
  -r  --restaurant                    Load a review for a restaurant of the JSON provided using its name.
  -n  --numberOfReviews               Load a defined number of reviews (for each restaurant)
                                      among the provided ones.

NOTE: restaurants must be previously loaded to generate reviews.

```

Or from inside the container:

```
docker exec -i -t <tourguide-container> node tutorials.TourGuide-App/server/feeders/reviewsgenerator.js --help
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
