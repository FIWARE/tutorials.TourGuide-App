# How to connect STH-Comet to Orion Context Broker
The data generated from Orion Context Broker is comming from different registered entities, and in order to be able to store it for a period of time rather than only retrieving the most recent result, we need to store these so called "historical raw and aggregated time series context information" into the STH component, where STH is a Short-Term Historic database built on top of MongoDB.

Therefore, the three main components used are:
* [Orion Context Broker](https://fiware-orion.readthedocs.io/en/master/ "OrionCB Documentation")
* [STH-Comet](https://fiware-sth-comet.readthedocs.io/en/latest/ "STH-Comet Documentation")
* [MongoDB](https://docs.mongodb.com/ "MongoDB Documentation")

In the image below we can see that the user can apply operation using RestAPI. All operations are sent to the Orion Context Broker to be procecced. STH-commet is in turn provides the capability to store historical data, and here it is stored to MongoDB database.

![Architecture](Images/Architecture.png "STH&CB connection architecture")

Suppose you have various applications on various containers and all of those containers are actually linked together, and you don’t want to execute each of those containers one by one but you want to run those containers at once with a single command. So that’s where [docker compose](https://docs.docker.com/compose/compose-file/#service-configuration-reference) comes to the picture, with docker compose we can actually run multiple applications, present in various containers, with one single command “docker-compose up”. As you can see in the example below, we are able to define three containers; one running an orion Context-Broker, one running a MongoDB and another running an STH-comet in a *.yml file, that is called “docker-compose” file.

To walk through this tutorial you need to make sure that you have docker and docker compose running on your machine. Please, follow the installation process for docker-compose [here](https://docs.docker.com/compose/install/) based on your operating system.

After ensuring that you have docker and docker-compose running on your machine. You need to make a directory and to create a  docker-compose.yml file as in the example below.

![docker-compose.yml](Images/docker-compose.png "docker compose yaml file")

You need to notice here that the STH component allows the user to configure the component using *.conf file or *.js, but if we set environment variables then it has the precedence over other configurations set in one of the files. For more info about the STH environment variable you can find it [here](https://fiware-sth-comet.readthedocs.io/en/latest/running/index.html?q=DB_URI&check_keywords=yes&area=default).

# Running The Example
The steps that are going to be taken are the following:

* Run the docker compose (*.yml) file
* Publish Context Information to Orion Context Broker (CB)
* Create a Subscription to notify the STH
* Update values in different periods of time
* Retrieve time series and aggregated Data

## **Step by step:**
Remove all docker containers (optional)
 ```console
$ docker rm `docker ps -aq`
```
Remove all docker images (optional)
```console
$ docker rmi $(docker images -a -q)
```
To run the 3 components together (mongodb-orionCB-STH), you need to change to the directory containing the folder that has the docker-compose.yml file, then you run the following docker-compose command:
```console
$ docker-compose up
```
To check the images built on your local machine
```console
$ docker images

REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
fiware/orion        latest              d6ff87a7b412        6 days ago          266MB
mongo               3.4                 baea457313ee        3 weeks ago         360MB
fiware/sth-comet    latest              6915eeff95d3        4 months ago        294MB
```
To check the current running containers
```console
$ docker ps

CONTAINER ID        IMAGE               COMMAND                  CREATED                  STATUS              PORTS                    NAMES
ccb6441ba878        fiware/orion        "/usr/bin/contextBro…"   Less than a second ago   Up 10 seconds       0.0.0.0:1026->1026/tcp   orion
c832cb36bdfc        fiware/sth-comet    "/bin/sh -c bin/sth"     Less than a second ago   Up 10 seconds       0.0.0.0:8666->8666/tcp   sth
44dea317f258        mongo:3.4           "docker-entrypoint.s…"   Less than a second ago   Up 11 seconds       27017/tcp                mongo

```

We see that the three containers are running now. Here, we can notice that the Orion Context Broker application is running on port 1026 as we specified in the “docker-compose.yml” file, as well as the STH application is running on the port 8666, and mongodb is running on port 27017.

To make REST API Calls:
There are many HTTP clients that can help you quickly test web services.
* Postman application: http://www.getpostman.com/
* Command Line using curl: https://curl.haxx.se/docs/httpscripting.html

In our example we are using Postman to perform CRUD (Create, Remove, Update, Delete) operations.

In order to check if the Orion Context Bbroker and the STH are really working and responsive we can test by querying the version of each and check if we get an answer. 

Once we open postman we need to specify that we need to do a GET query and we need to specify the destination (URI:port), in our case the queried destination is as follows:

> localhost:1026/version

![checking if OrionCB is working](Images/CB-version.png)

> localhost:8666/version

![Checking if STH-Comet is working](Images/STH-version.png)

Noe, to check whether the db is accessible as well, we need to connect to mongo container and execute the mongo command to access the mongo shell.
```console
$ docker exec -it mongo mongo

MongoDB shell version v3.4.13
connecting to: mongodb://127.0.0.1:27017
MongoDB server version: 3.4.13
Welcome to the MongoDB shell.
For interactive help, type "help".
For more comprehensive documentation, see
	http://docs.mongodb.org/
Questions? Try the support group
	http://groups.google.com/group/mongodb-user
Server has startup warnings: 
2018-03-08T11:50:52.662+0000 I STORAGE  [initandlisten] 
2018-03-08T11:50:52.662+0000 I STORAGE  [initandlisten] ** WARNING: Using the XFS filesystem is strongly recommended with the WiredTiger storage engine
2018-03-08T11:50:52.662+0000 I STORAGE  [initandlisten] **          See http://dochub.mongodb.org/core/prodnotes-filesystem
2018-03-08T11:50:52.764+0000 I CONTROL  [initandlisten] 
2018-03-08T11:50:52.765+0000 I CONTROL  [initandlisten] ** WARNING: Access control is not enabled for the database.
2018-03-08T11:50:52.765+0000 I CONTROL  [initandlisten] **          Read and write access to data and configuration is unrestricted.
2018-03-08T11:50:52.765+0000 I CONTROL  [initandlisten] 
>
```

```console
> show dbs
admin  0.000GB
local  0.000GB
orion  0.000GB
```

## Operations on Entities

When saying “entity” we mean an object that we need to add to the Ccontext Bbroker so we can start reading, updating, subscribing to one of its attributes in order to be notified once a values has been changed. The operations that we can perform on the entities are Post, Get, Put, Delete.

### Create Entity

We need to perform POST request to the following destination as follows:

> localhost:1026/v2/entities

![registed device](Images/CreateEntity.png)

We need to specify some header values too when sending the request:

![Headers to pass](Images/Header.png)

“Content-type” is to specify the type of data that we want to send, always application/json.

“Fiware-Service” and “FiwareServicepath” are intended the logical separation of the data, this is called multi-tenant model, this term refers to software architecture in which a single instance of software runs on a server and servs multiple tenants. For example; Fiware-Service: Tenant1. Also, a service path is a hierarchical scope assigned to an entity at creation time. For example; Fiware-ServicePath: /some/hierarchical/path.

_Note: these headers need to be set for all the operations we perform in this example._

### Add more than one entity
We need to do a POST request to the following destination

> localhost:1026/v2/**op/update**

![add multiple entities](Images/AddMoreThanOneEntity.png)

### Query all registered entities:
To query all entities that have been created we need to perform a GET operation on the following destination (the query should retrieve all previous entities we added previously)

> localhost:1026/v2/entities

![Select All entities](Images/selectAllEntities.png)



## Operations on Attributes
Another type of modifications can be done on attributes as individuals rather than the whole entity, these operations can be done on attributes. Such operations are; get attribute, put attribute, get value of an attribute, put value for specific attribute, and delete an attribute. 

### Modify an Attribute
In our case we want to modify the attribute value for the Car1 entity, this can be done by performing a PUT request to the following destination with the same 3 headers parameters we passed previously

> localhost:1026/v2/entities/Car1/attrs/speed/value

![modify attribute's value](Images/modifyAValue.png)

## Create Subscriptions

Context Consumers can subscribe to receive context information that satisfy certain conditions using the subscribe operation. Such subscriptions may have an expiration time. In return, the Context Broker notifies updates on context information to subscribed Context Consumers by invoking the notify operation they export.

The _entities_ and _notifications_ subfields define the contents of the notification messages. 

* "idPattern" is used to filter which entities we want. Its value is a regular expression. In our example we set it to retrieve all.
* The URL where to send notifications is defined with the  url sub-field. Here we specified the URL of the STH-Comet.
* "AttrsFormat": we set it to legacy because the STH only understands NGSI v1 notification payloads.
* Subscriptions may have an expiration date (expires field), specified using the ISO 8601 standard format. Once subscription overpass that date, the subscription is simply ignored.

> localhost:1026/v2/subscriptions

![Add Subscription](Images/CreateSubscription.png)

After creating a subscription we need to update the attribute values the same way we did before to be able to query some aggregations using the STH API. To see changes we need to update the attribute value in different times, the following example shows how we can change an attribute value several times

![updating multiple values](Images/modifyValuesSeveralTimes.png)

## Query Time Series Values
Here we will query, through the STH, all the raw data for the values that have been changed. therefore we need to perform GET operation for the following destination:

> localhost:8666/STH/v1/contextEntities/type/Car/id/Car1/attributes/speed?lastN=20

![STH Raw Data](Images/QueryTimeSeriesValues.png)


In the response payload we can see that the name of the changed attribute is "speed", followes with the values that have been changed within different time periods. For Exmple; we can see that the speed value 22 is happened on "2018-03-05T12:00:56:728Z".

## Resoulution and Aggregation

**aggrMethod:** The aggregation method. The STH component supports the following aggregation methods: _max_ (maximum value), _min_ (minimum value), _sum_ (sum of all the samples) and sum2 (sum of the square value of all the samples) for numeric attribute values and occur for attributes values of type string. Combining the information provided by these aggregated methods with the number of samples, it is possible to calculate probabilistic values such as the average value, the variance as well as the standard deviation. It is a mandatory parameter.
**aggrPeriod:** Aggregation period or resolution. A fixed resolution determines the origin time format and the possible offsets. It is a mandatory parameter. Resolution or aggregation period is the time period by which the aggregated time series information is grouped. Possible valid resolution values supported by the STH are: month, day, hour, minute and second.
Note: In our example, aggregated time series context information is set for a resolution of minutes because we are performing changes on attribute’s value in seconds. Therefore,  if values are changing in hourly manner then we set the aggregated time period parameter to day so we can see the underlying hourly changes.

For more info you can go the the [StH-Comet documentation](https://fiware-sth-comet.readthedocs.io/en/latest/getting-started/index.html "Resolution&Aggregation query parameters documentation").

###  Retrieve the Maximum Value
Here we perform a GET request to the following destination

> localhost:8666/STH/v1/contextEntities/type/Car/id/Car1/attributes/speed?aggrMethod=max&aggrPeriod=minute&dateFrom=2016-01-22T00:00:00.000Z&dateTo=2020-01-22T23:59:59.999Z

![max of the updated values](Images/max.png)

In this example, we can see that the resolution that we are performing our queries at is in _mitues_. Therefore when quering the maximum number for an attribute we will have a maximum value for each minute. We can see that the origin time is "2018-03-08T12:00:00:000Z" .In our example we see that in the minute 47 we have 2 samples and the maximum number is 50. Whereas, in the minute 48 we have 10 samples and the maximum value is 100.

### Retrieve Occurrences
Here we perform a GET request to the following destination

> localhost:8666/STH/v1/contextEntities/type/Car/id/Car1/attributes/speed?aggrMethod=**occur**&aggrPeriod=**minute**&dateFrom=2016-01-22T00:00:00.000Z&dateTo=2020-01-22T23:59:59.999Z

![occur aggregation](Images/Occurunces.png)

In the picture we can see that for the hour 11:00 and minute 58 we have only 1 sample that has occured. Whereas, for the hour 12:00 and minute 1 we have 3 samples that have been occured.


### Retrieve the Sumation
Here we perform a GET request to the following destination

> localhost:8666/STH/v1/contextEntities/type/Car/id/Car1/attributes/speed?aggrMethod=**sum**&aggrPeriod=**minute**&dateFrom=2016-01-22T00:00:00.000Z&dateTo=2020-01-22T23:59:59.999Z

![aggregated data - sum](Images/SumAggregation.png)

