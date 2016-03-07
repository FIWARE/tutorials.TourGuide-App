## FIWARE Developers Guide App - Docker image

[FIWARE Developers Guide App](https://github.com/Fiware/tutorials.TourGuide-App) is the sample application used in the [FIWARE Developers Guide](http://www.fiware.org/tour-guide/) to show real code working with the Generic Enablers integrated.

This image is intended to work together with [Orion](https://registry.hub.docker.com/u/bitergia/fiware-orion/).

## Image contents

- [x] `ubuntu:14.04` baseimage available [here](https://hub.docker.com/_/ubuntu/)
- [x] Node.js
- [x] REST interface for working with Orion

## Usage

We strongly suggest you to use [docker-compose](https://docs.docker.com/compose/). With docker compose you can define multiple containers in a single file, and link them easily.

So for this purpose, we have already a simple file that launches:

   * A MongoDB image with pre-loaded data
   * Orion Context Broker as a service
   * IDM Keyrock
   * PEP Proxy
   * Authzforce
   * IDAS
   * Cygnus
   * TourGuide app

The file `docker-compose.yml` can be downloaded from [here](https://raw.githubusercontent.com/Fiware/tutorials.TourGuide-App/master/docker/compose/docker-compose.yml).

Once you get it, you just have to pull the images:
```
docker-compose pull
```
And then start the containers:
```
docker-compose up -d
```

Note that even though the `docker-compose up -d` does also pull the images, we suggest to do it separately to avoid synchronization issues.

Also, there are several enviroment variables that you can configure in the [docker-compose.yml](https://raw.githubusercontent.com/Fiware/tutorials.TourGuide-App/master/docker/compose/docker-compose.yml):

   * `ORION_HOSTNAME`. Hostname of the Orion application protected by a proxy. By default the value is `pepwilma`
   * `ORION_NO_PROXY_HOSTNAME`. Hostname of the Orion application without proxy. By default the value is `orion`
   * `ORION_PORT`. Port of the Orion application. By default the value is `1026`
   * `ORION_PEP_ENABLED`. Activate the PEP Proxy. By default the value is `true`
   * `IDAS_PORT`. Port of the IDAS application. By default the value is `8080`
   * `SENSORS_GENERATION_ENABLED`. Enables sensors generation for each restaurant. By default the value is `false`.
   * `ORION_SUBSCRIPTIONS_ENABLED`. Activates the Orion sensors subscription, updating the Restaurant information. By default the value is `false`. **Note**: `SENSORS_GENERATION_ENABLED` must be set to `true`, otherwise there won't be sensors and no data will be generated.
   * `SENSORS_FORCED_UPDATE_ENABLED`. Updates the values of the sensors. By default the value is `false`. **Note**: `SENSORS_GENERATION_ENABLED` must be set to `true`, otherwise there won't be sensors and no data will be generated.

And all the services will be up. End to end testing can be done using the REST interface. And example application is [the restaurant data feeder](https://github.com/Fiware/tutorials.TourGuide-App/blob/master/server/feeders/restaurantfeeder.js).

**Note**: as retrieving the `<container-ip>` for TourGuide and orion containers can be a bit 'tricky', we've created a set of utilities and useful scripts for handling docker images. You can find them all [here](https://github.com/Bitergia/docker/tree/master/utils).

## What if I don't want to use docker-compose?

No problem, the only thing is that you will have to deploy an Orion container yourself and configure its IP as Orion name inside the TourGuide container.

### Logs and other commands ###

By default, TourGuide show the logs from apache via `docker logs <container-id>` command.

If you need to run another command in the same container, you can use the `docker exec` command.

## IdM Users, Organizations, Apps, Roles and Permissions

This IdM image is intended to work with [Fiware TourGuide-App](https://github.com/Fiware/tutorials.TourGuide-App). Due to this, we've generated Users, Organizations, Apps, Roles and Permissions adapted to it in this uncoupled  [file](https://github.com/Fiware/tutorials.TourGuide-App/blob/master/docker/images/tutorials.tourguide-app/keystone_provision.py).

**Note** the following provision is intended just for testing purposes. To add/remove information to this image, you can always use the [Identity API](http://developer.openstack.org/api-ref-identity-v3.html)

### Users

| Role     | Username           | Password   |
|----------|--------------------|------------|
| Admin    | idm                | idm        |
| Provider | pepproxy@test.com  | test       |
| Owner    | user0@test.com     | test       |
| Owner    | user1@test.com     | test       |
| Owner    | user2@test.com     | test       |
| Owner    | user3@test.com     | test       |
| Owner    | user4@test.com     | test       |
| Owner    | user5@test.com     | test       |
| Owner    | user6@test.com     | test       |
| Owner    | user7@test.com     | test       |
| Owner    | user8@test.com     | test       |
| Owner    | user9@test.com     | test       |

### Organizations (or *projects* if using the [Identity API](http://developer.openstack.org/api-ref-identity-v3.html))

| Organization name   | Description                    | Users                     |
|---------------------|--------------------------------|---------------------------|
| Franchise1          | Franchise1                     | user0@test.com (owner)    |
| Franchise2          | Franchise2                     | user0@test.com (owner)    |
| Franchise3          | Franchise3                     | user0@test.com (owner)    |
| Franchise4          | Franchise4                     | user0@test.com (owner)    |


### Apps

| Application name  | Description                       | URL                       | Redirect URI                     |
|-------------------|-----------------------------------|---------------------------|----------------------------------|
| FIWARE devGuide   | Fiware devGuide Test Application  | http://tourguide          | http://tourguide/login           |

### Roles

| Role name           | Granted to user                         |
|---------------------|-----------------------------------------|
| Provider            | pepproxy@test.com                       |
| End user            | All                                     |
| Franchise Manager   | user0@test.com     (Franchise1)         |
| Franchise Manager   | user1@test.com     (Franchise2)         |
| Franchise Manager   | user2@test.com     (Franchise3)         |
| Franchise Manager   | user3@test.com     (Franchise4)         |
| Global Manager      | user0@test.com                          |

### Permissions

We've added several permissions for Orion Operations. You can check all of them by accessing the IdM or [here](https://github.com/Fiware/tutorials.TourGuide-App/blob/master/docker/images/tutorials.tourguide-app/keystone_provision.py#L186)

## User feedback

### Documentation

All the information regarding the image generation is hosted publicly on [Github](https://github.com/Fiware/tutorials.TourGuide-App/tree/master/docker/images/tutorials.TourGuide-App).

### Issues

If you find any issue with this image, feel free to contact us via [Github issue tracking system](https://github.com/Fiware/tutorials.TourGuide-App/issues).
