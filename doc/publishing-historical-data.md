# Publishing historical data

This section assumes that you already have some sensors working with with the Tour Guide Application. If you have not do so, please see [Managing IoT data](managing-iot-data.md) above.

In order to persist data from Orion, we will be using the Cygnus connector to send and store the data on a MySQL database.

## Cygnus configuration

The default configuration uses a MySQL container with the default database and `root` user with `mysql` as password.  If you want to change this configuration, you can use the `tourguide configure cygnus` command to change these credentials.

```
$ ./tour-guide configure cygnus --help
Usage: tour-guide configure cygnus [-h | --help] [-u <username> | --mysql-user <username>]
                                   [-p <password> | --mysql-password <password>]

Apply configuration changes for cygnus.

Command options:

  -h  --help                         Show this help.
  -u  --mysql-user <username>        Set the MySQL database user to use.
                                     Default value is 'root'.
  -p  --mysql-password <password>    Set the MySQL database password to use.
                                     Default value is 'mysql'.
```

i.e. to change the MySQL credentials used for Cygnus to `myuser` and `mypassword`, issue the following command:
```
$ ./tour-guide configure cygnus --mysql-user myuser --mysql-password mypassword
```


This will update the `docker-compose.yml` file and set the following variables for the Cygnus container:

```
- CYGNUS_MYSQL_USER=myuser
- CYGNUS_MYSQL_PASS=mypassword
```

This variables will be used by the Cygnus container to update the following MySQL credentials on the `agent.conf` configuration file when the container starts:
```
cygnus-ngsi.sinks.mysql-sink.mysql_username = myuser
cygnus-ngsi.sinks.mysql-sink.mysql_password = mypassword
```
For more information on other available configuration options for the Cygnus container, see [Using the image](https://github.com/telefonicaid/fiware-cygnus/blob/master/docker/cygnus-ngsi/README.md#section3) on the Cygnus repository.  For more complex configuration options, see the [official documentation for Cygnus](https://fiware-cygnus.readthedocs.io/en/latest/).

Besides the Cygnus container modifications, the following variables will be set for the MySQL container:

```
- MYSQL_USER=myuser
- MYSQL_PASSWORD=mypassword
- MYSQL_DATABASE=tourguide
```

The `MYSQL_DATABASE` variable defines the database to be used.  As we are using a user with no superuser privileges, we need to tell the MySQL container to create the database for us.  The database name will be the same as the 'Fiware Service' used for the sensors, which defaults to `tourguide` for the Tour Guide Application.  If we were using the `root` user, there would be no need to specify the database name, as that would be created on demand.


## Subscriptions

After the system is configured and running, we need to tell Orion that we want it to send the data as it changes. To do this we need to register a subscription on Orion for Cygnus.

Imagine we want to store the temperature changes on a restaurant over a period of time.  We then need to tell Orion to send us the information whenever any of the temperature sensors value for the restaurant changes. To do this we need the following information:

- Id of the restaurant, e.g. `0115206c51f60b48b77e4c937835795c33bb953f`
- the type of the sensor, e.g. `temperature`
- the room of the sensor, e.g. `kitchen`

With this information, we will send a POST request to `http://localhost:1026/v1/subscribeContext` with a payload like this:
```
{
    "entities": [
        {
            "type": "Restaurant",
            "isPattern": "false",
            "id": "0115206c51f60b48b77e4c937835795c33bb953f"
        }
    ],
    "attributes": [
        "temperature:kitchen"
    ],
    "reference": "http://cygnus:5050/notify",
    "duration": "P1M",
    "notifyConditions": [
        {
            "type": "ONCHANGE",
            "condValues": [
                "temperature:kitchen"
            ]
        }
    ],
    "throttling": "PT1S"
}
```
The `reference` field specifies the Cygnus endpoint to use.  The default used in the container is `http://cygnus:5050/notify`. Now, every time the value of the sensor changes, Orion will send a notification to Cygnus with this change and Cygnus will store it on the database. In this example we are just requesting changes for a single sensor in a single restaurant. If you want something more complex, or for a detailed description on subscriptions, see `Context subscriptions` under [Context management using NGSI10](http://fiware-orion.readthedocs.io/en/latest/user/walkthrough_apiv1/#context-management-using-ngsi10) on the official documentation for Orion Context Broker.

Included with TourGuide, there are two sample subscription scripts available at [docker/cygnus/subscriptions](https://github.com/Fiware/tutorials.TourGuide-App/tree/develop/docker/cygnus/subscriptions):

- subscription-therm-sensors.sh
- subscription-humidity-sensors.sh

Please note that to use these scripts you need to update your hosts file with the running containers (see `tourguide configure hosts --help` command) before executing them.

Once we have done the subscription, we will receive an initial notification with the current data.  This can be seen in the log of the Cygnus container:
```
$ docker logs cygnus
```
You should see something like this:
```
time=2016-09-28T13:40:46.872Z | ... | srv=tourguide | subsrv=/Franchise1 | comp=cygnus-ngsi | op=getEvents | msg=com.telefonica.iot.cygnus.handlers.NGSIRestHandler[264] : Received data ({  "subscriptionId" : "57ebc85e0698bea0a46bc2b1",  "originator" : "localhost",  "contextResponses" : [	{  	"contextElement" : {    	"type" : "Restaurant",    	"isPattern" : "false",    	"id" : "0115206c51f60b48b77e4c937835795c33bb953f",    	"attributes" : [      	{        	"name" : "temperature:kitchen",        	"type" : "Number",        	"value" : "25"      	}    	]  	},  	"statusCode" : {    	"code" : "200",    	"reasonPhrase" : "OK"  	}	}  ]})

...

time=2016-09-28T13:40:50.930Z | ... | srv=tourguide | subsrv=/Franchise1 | comp=cygnus-ngsi | op=processNewBatches | msg=com.telefonica.iot.cygnus.sinks.NGSISink[417] : Batch completed, persisting it
time=2016-09-28T13:40:50.931Z | ... | srv=tourguide | subsrv=/Franchise1 | comp=cygnus-ngsi | op=persistAggregation | msg=com.telefonica.iot.cygnus.sinks.NGSIMySQLSink[455] : [mysql-sink] Persisting data at OrionMySQLSink. Database (tourguide), Table (Franchise1_0115206c51f60b48b77e4c937835795c33bb953f_Restaurant), Fields ((recvTimeTs,recvTime,fiwareServicePath,entityId,entityType,attrName,attrType,attrValue,attrMd)), Values (('1475070046874','2016-09-28T13:40:46.874','/Franchise1','0115206c51f60b48b77e4c937835795c33bb953f','Restaurant','temperature:kitchen','Number','25','[]'))
```

There we can see that Cygnus should have stored the information on the `Franchise1_0115206c51f60b48b77e4c937835795c33bb953f_Restaurant` table of the `tourguide` database. We can check if this is true by connecting to the MySQL database:
```
$ docker exec -i -t mysql mysql -u root -p tourguide

mysql> show tables;
+----------------------------------------------------------------+
| Tables_in_tourguide                                        	|
+----------------------------------------------------------------+
| Franchise1_0115206c51f60b48b77e4c937835795c33bb953f_Restaurant |
+----------------------------------------------------------------+
1 row in set (0.00 sec)

mysql> select * from Franchise1_0115206c51f60b48b77e4c937835795c33bb953f_Restaurant;
+---------------+-------------------------+-------------------+------------------------------------------+------------+---------------------+----------+-----------+--------+
| recvTimeTs	| recvTime            	| fiwareServicePath | entityId                             	| entityType | attrName        	| attrType | attrValue | attrMd |
+---------------+-------------------------+-------------------+------------------------------------------+------------+---------------------+----------+-----------+--------+
| 1475070046874 | 2016-09-28T13:40:46.874 | /Franchise1   	| 0115206c51f60b48b77e4c937835795c33bb953f | Restaurant | temperature:kitchen | Number   | 25    	| [] 	|
+---------------+-------------------------+-------------------+------------------------------------------+------------+---------------------+----------+-----------+--------+
1 row in set (0.00 sec)
```

As we can see, the temperature in the kitchen of the restaurant with Id `0115206c51f60b48b77e4c937835795c33bb953f` is `25` degrees.  Let's see what happens when the temperature changes.  To do this, we will use the following command:
```
$ ./tour-guide sensors send-data -i "0115206c51f60b48b77e4c937835795c33bb953f-kitchen-temperature" -d "t|21"
```

We can see that Orion sends a new notification with the temperature change:
```
time=2016-09-28T14:01:42.136Z | ... | srv=tourguide | subsrv=/Franchise1 | comp=cygnus-ngsi | op=getEvents | msg=com.telefonica.iot.cygnus.handlers.NGSIRestHandler[264] : Received data ({  "subscriptionId" : "57ebc85e0698bea0a46bc2b1",  "originator" : "localhost",  "contextResponses" : [	{  	"contextElement" : {    	"type" : "Restaurant",    	"isPattern" : "false",    	"id" : "0115206c51f60b48b77e4c937835795c33bb953f",    	"attributes" : [      	{        	"name" : "temperature:kitchen",        	"type" : "Number",        	"value" : "21"      	}    	]  	},  	"statusCode" : {    	"code" : "200",    	"reasonPhrase" : "OK"  	}	}  ]})
time=2016-09-28T14:01:42.141Z | ... | srv=tourguide | subsrv=/Franchise1 | comp=cygnus-ngsi | op=processNewBatches | msg=com.telefonica.iot.cygnus.sinks.NGSISink[363] : Batch accumulation time reached, the batch will be processed as it is
time=2016-09-28T14:01:42.142Z | ... | srv=tourguide | subsrv=/Franchise1 | comp=cygnus-ngsi | op=processNewBatches | msg=com.telefonica.iot.cygnus.sinks.NGSISink[417] : Batch completed, persisting it
```

If we check the database again, we see the new value has been stored alongside the old value:
```
$ docker exec -i -t mysql mysql -u root -p tourguide

mysql> select * from Franchise1_0115206c51f60b48b77e4c937835795c33bb953f_Restaurant;
+---------------+-------------------------+-------------------+------------------------------------------+------------+---------------------+----------+-----------+--------+
| recvTimeTs	| recvTime            	| fiwareServicePath | entityId                             	| entityType | attrName        	| attrType | attrValue | attrMd |
+---------------+-------------------------+-------------------+------------------------------------------+------------+---------------------+----------+-----------+--------+
| 1475070046874 | 2016-09-28T13:40:46.874 | /Franchise1   	| 0115206c51f60b48b77e4c937835795c33bb953f | Restaurant | temperature:kitchen | Number   | 25    	| [] 	|
| 1475071302136 | 2016-09-28T14:01:42.136 | /Franchise1   	| 0115206c51f60b48b77e4c937835795c33bb953f | Restaurant | temperature:kitchen | Number   | 21    	| [] 	|
+---------------+-------------------------+-------------------+------------------------------------------+------------+---------------------+----------+-----------+--------+
2 rows in set (0.00 sec)
```

We can check that this value is the one stored on Orion with:
```
curl --header 'Fiware-Service: tourguide' --header 'Accept: text/plain' http://localhost:1026/v2/entities/0115206c51f60b48b77e4c937835795c33bb953f/attrs/temperature:kitchen/value
```
This should return:
```
"21"
```

If the temperature keeps changing, the new values will be notified to Cygnus and stored in the database.
