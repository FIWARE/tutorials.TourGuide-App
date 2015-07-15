## FIWARE Developers Guide App - Docker image

[FIWARE Developers Guide App](https://github.com/Bitergia/fiware-devguide-app) is the sample application used in the [FIWARE Developers Guide](http://www.fiware.org/tour-guide/) to show real code working with the Generic Enablers integrated.

This image is intended to work together with [Orion](https://registry.hub.docker.com/u/bitergia/fiware-orion/). 

## Image contents

- [x] `bitergia/ubuntu-trusty` baseimage contents listed [here](https://github.com/Bitergia/docker/tree/master/baseimages/ubuntu#image-contents)
- [x] Node.js
- [x] REST interface for working with Orion

## Usage

We strongly suggest you to use [docker-compose](https://docs.docker.com/compose/). With docker compose you can define multiple containers in a single file, and link them easily. 

So for this purpose, we have already a simple file that launches:

   * A MongoDB database
   * Data-only container for the MongoDB database
   * Orion Context Broker as a service
   * Devguide app

The file `docker-compose.yml` can be downloaded from [here](https://raw.githubusercontent.com/Bitergia/fiware-devguide-app/master/docker/compose/docker-compose.yml).

Once you get it, you just have to:

```
docker-compose up -d
```

And all the services will be up. End to end testing can be done using the REST interface. And example application is [the restaurant data feeder](https://github.com/Bitergia/fiware-devguide-app/blob/master/server/restaurant_feeder.js).

**Note**: as retrieving the `<container-ip>` for devguide and orion containers can be a bit 'tricky', we've created a set of utilities and useful scripts for handling docker images. You can find them all [here](https://github.com/Bitergia/docker/tree/master/utils).

 
## What if I don't want to use docker-compose?

No problem, the only thing is that you will have to deploy an Orion container yourself and configure its IP as Orion name inside the devguide container. 

## About SSH

SSH is enabled by default with a pre-generated insecure SSH key. As the image us based in `bitergia/ubuntu-trusty` image, it contains the same SSH privileges.
That means, for accessing the image through SSH, you will need the SSH insecure keys. Those keys are the following:

* `bitergia-docker` - Available [here](https://raw.githubusercontent.com/Bitergia/docker/master/baseimages/bitergia-docker)
* `bitergia-docker.pub` - Available [here](https://raw.githubusercontent.com/Bitergia/docker/master/baseimages/bitergia-docker.pub)

Once the container is up, you can access the container easily by using our own [docker-ssh](https://github.com/Bitergia/docker/tree/master/utils#docker-ssh) script:

```
docker-ssh bitergia@<container-id>
```

Or you can just use the old-fashioned way to access a docker container: 

```
ssh bitergia@<container-ip>
```

Container IP can be retrieved using the following command:

```
docker inspect -f "{{ .NetworkSettings.IPAddress }}" <container-id>
```

You can also use the [get-container-ip](https://github.com/Bitergia/docker/tree/master/utils#get-container-ip) script provided in this repository. 

### Using/generate your own SSH key

Information on how to do that can be found [here](https://github.com/Bitergia/docker/tree/master/baseimages/ubuntu#about-ssh).
**Note** that the information below is regarding the `bitergia/ubuntu-trusty` baseimage. If you have already pulled or made a `bitergia/fiware-devguide-app` image based in the `bitergia/ubuntu-trusty` image before applying the keys change, you will need to re-build both images again.

## User feedback

### Documentation

All the information regarding the image generation is hosted publicly on [Github](https://github.com/Bitergia/fiware-devguide-app/tree/master/docker/images/fiware-devguide-app).

### Issues

If you find any issue with this image, feel free to contact us via [Github issue tracking system](https://github.com/Bitergia/fiware-devguide-app/issues).
