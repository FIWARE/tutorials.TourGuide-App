# Cygnus - Default Configuration file

**Table of Contents**

- [Activate subscriptions and uncoupled configuration file](#activate-subscriptions-and-uncoupled-configuration-file)
- [Persist Context Data](#presist-context-data)
	- [CKAN](#ckan)
	- [HDFS](#HDFS) 
	- [MySQL](#mysql)

## Activate subscriptions and uncoupled configuration file

We have setup three "ONCHANGE" subscriptions for temperature, humidity and occupancy levels.

To activate the subscriptions mentioned below, you probably will have to modify the [docker-compose.yml](https://raw.githubusercontent.com/Fiware/tutorials.TourGuide-App/develop/docker-compose.yml) file provided in the repository. By default it looks for the file at the path:

```
~/devel/tutorials.TourGuide-App/docker/cygnus/subscriptions
```

So you will have to modify it to match yours.

Same for the Cygnus configuration file. Docker-compose loads the subscriptions and the uncoupled `cignus.conf` file into the container.

## Persist Context Data

The configuration file provided in this folder is already configured to publish in both HDFS in CKAN (just credentials needed).
**Note**: By default sensors generation is disabled in the Docker-compose file. To do that, you will need to activate it by setting the environment variable `SENSORS_GENERATION_ENABLED` to `true` in the [docker-compose.yml](https://raw.githubusercontent.com/Fiware/tutorials.TourGuide-App/develop/docker-compose.yml) file. Find out more at the [Image Usage section](https://github.com/Fiware/tutorials.TourGuide-App/tree/develop/docker/images/tutorials.TourGuide-App#usage).

### CKAN

Publishing in CKAN (http://demo.ckan.org) should be as simple as modifying the `cygnus.conf` file, adding the API Key to each sink (account needed):

```
# CKAN API key: the same for both
cygnusagent.sinks.ckan-sink-temp.api_key = 
cygnusagent.sinks.ckan-sink-humidity.api_key = 
cygnusagent.sinks.ckan-sink-occupancy.api_key = 
```

### HDFS

To public in HDFS you will need credential for the fiware [Cosmos](https://github.com/telefonicaid/fiware-cosmos) instance. Then, modifying the `cygnus.conf` file:

```
...
# Account in https://cosmos.lab.fiware.org/ allowed to write in HDFS
cygnusagent.sinks.hdfs-sink.hdfs_username = 
cygnusagent.sinks.hdfs-sink.hdfs_password = 
# Follow http://stackoverflow.com/questions/31187977/oauth2-access-to-cosmos-webhdfs-in-fiware-lab
cygnusagent.sinks.hdfs-sink.oauth2_token = 
...
```

### MySQL

To persist data in MySQL (in our case, we use mariadb), the procedure is a bit different. There's no need to modify the `cygnus.conf` file, but the [docker-compose.yml](https://raw.githubusercontent.com/Fiware/tutorials.TourGuide-App/develop/docker-compose.yml). So we will need to add mariadb to our compose file as follows:

```
mariadbdata:
    image: mariadb:10.0
    volumes:
        - /var/lib/mysql
    restart: no
    command: /bin/echo "Data-only container for mariadb."

mariadb:
    image: mariadb:10.0
    volumes_from:
        - mariadbdata
    expose:
        - "3306"
    environment:
        - MYSQL_ROOT_PASSWORD=bitergia
    command: --verbose
```

And in the `cygnus` section, we must add:

```
cygnus:
    links:
        - mariadb
    environment:
        - MYSQL_HOST=mariadb
        - MYSQL_PORT=3306
        - MYSQL_USER=root
        - MYSQL_PASSWORD=bitergia
 ```
