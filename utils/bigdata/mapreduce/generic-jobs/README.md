#<a name="top"></a>generic-jobs application
Content:

* [Introduction](#section1)
* [Installation and run](#section2)
    * [`AttrStatsGetter` job](#section2.1)
* [Contact](#section3)

##<a name="section1"></a>Introduction
`generic-jobs` is an application containing several general-purpose MapReduce jobs in charge of doing certain analysis on NGSI-like data stored through [Cygnus](https://github.com/telefonicaid/fiware-cygnus) in a HDFS store.

[Top](#top)

##<a name="section2"></a>Installation and run
Build the application with Maven:

    $ cd utils/bigdata/mapreduce/generic-analyzers
    $ mvn clean compile assemby:single

A Java jar file will be added to `target/` folder. This jar is the one you must run by using the `hadoop jar` command:

    $ hadoop jar \
       target/generic-jobs-0.0.0-SNAPSHOT-jar-with-dependencies.jar \
       org.fiware.devguideapp.utils.bigdata.mapreduce.AttrStatsGetter \
       -libjars target/generic-jobs-0.0.0-SNAPSHOT-jar-with-dependencies.jar \
       <file system host> \
       <file system port> \
       <HDFS input> \
       <HDFS output> \
       <file format>

As seen, the following arguments must be give:

* The Java jar file containing the application that is going to be run.
* The fully-qulified class name of the particular MapReduce job that is going to be run. Available jobs are:
    * `AttrStatsGetter`
* Any other libraries (in the form of Java jar files) that may be needed for running the application.
* The HDFS file system host or namenode ip address/FQDN.
* The port the above service listens, typically TCP/8020.
* The base inout folder where the data is stored within HDFS. This is recursively iterated in order to find all the datasets within this folder and any sub-folder.
* The output folder the analysis results will be put by the applicaiton.
* The file format the data is written; this inherits from [Cygnus](https://github.com/telefonicaid/fiware-cygnus), and available types are:
     * `josn-row`
     * `json-column`
     * `csv-row`
     * `csv-column`

###<a name="section2.1"></a>`AttrStatsGetter` job
This is a MapReduce job in charge of getting certain statistics on the (numeric) NGSI-like attributes that are stored within the given HDFS datasets. Specifically, the statistics gotten are:

* Maximum value.
* Minimum value.
* Average.
* Variance.

An example of run is the following one:

```
$ hadoop jar target/generic-jobs-0.0.0-SNAPSHOT-jar-with-dependencies.jar org.fiware.devguideapp.utils.bigdata.mapreduce.AttrStatsGetter -libjars target/generic-jobs-0.0.0-SNAPSHOT-jar-with-dependencies.jar 192.168.189.1 8020 /user/acs/devguideidas/temperature/sensor_temp_zuia_20plaza_20kafe_kitchen_thing /user/acs/output json-column
15/11/05 09:06:32 WARN mapred.JobClient: Use GenericOptionsParser for parsing the arguments. Applications should implement Tool for the same.
15/11/05 09:06:32 INFO input.FileInputFormat: Total input paths to process : 1
15/11/05 09:06:32 WARN snappy.LoadSnappy: Snappy native library is available
15/11/05 09:06:33 INFO util.NativeCodeLoader: Loaded the native-hadoop library
15/11/05 09:06:33 INFO snappy.LoadSnappy: Snappy native library loaded
15/11/05 09:06:33 INFO mapred.JobClient: Running job: job_201507101501_22921
15/11/05 09:06:34 INFO mapred.JobClient:  map 0% reduce 0%
15/11/05 09:06:39 INFO mapred.JobClient:  map 100% reduce 0%
15/11/05 09:06:49 INFO mapred.JobClient:  map 100% reduce 7%
15/11/05 09:06:50 INFO mapred.JobClient:  map 100% reduce 29%
15/11/05 09:06:51 INFO mapred.JobClient:  map 100% reduce 85%
15/11/05 09:06:52 INFO mapred.JobClient:  map 100% reduce 100%
15/11/05 09:06:52 INFO mapred.JobClient: Job complete: job_201507101501_22921
15/11/05 09:06:52 INFO mapred.JobClient: Counters: 26
15/11/05 09:06:52 INFO mapred.JobClient:   Job Counters 
15/11/05 09:06:52 INFO mapred.JobClient:     Launched reduce tasks=9
15/11/05 09:06:52 INFO mapred.JobClient:     SLOTS_MILLIS_MAPS=4827
15/11/05 09:06:52 INFO mapred.JobClient:     Total time spent by all reduces waiting after reserving slots (ms)=0
15/11/05 09:06:52 INFO mapred.JobClient:     Total time spent by all maps waiting after reserving slots (ms)=0
15/11/05 09:06:52 INFO mapred.JobClient:     Rack-local map tasks=1
15/11/05 09:06:52 INFO mapred.JobClient:     Launched map tasks=1
15/11/05 09:06:52 INFO mapred.JobClient:     SLOTS_MILLIS_REDUCES=101708
15/11/05 09:06:52 INFO mapred.JobClient:   FileSystemCounters
15/11/05 09:06:52 INFO mapred.JobClient:     FILE_BYTES_READ=972
15/11/05 09:06:52 INFO mapred.JobClient:     HDFS_BYTES_READ=14575
15/11/05 09:06:52 INFO mapred.JobClient:     FILE_BYTES_WRITTEN=521680
15/11/05 09:06:52 INFO mapred.JobClient:     HDFS_BYTES_WRITTEN=28
15/11/05 09:06:52 INFO mapred.JobClient:   Map-Reduce Framework
15/11/05 09:06:52 INFO mapred.JobClient:     Map input records=54
15/11/05 09:06:52 INFO mapred.JobClient:     Reduce shuffle bytes=972
15/11/05 09:06:52 INFO mapred.JobClient:     Spilled Records=108
15/11/05 09:06:52 INFO mapred.JobClient:     Map output bytes=810
15/11/05 09:06:52 INFO mapred.JobClient:     CPU time spent (ms)=14140
15/11/05 09:06:52 INFO mapred.JobClient:     Total committed heap usage (bytes)=1584988160
15/11/05 09:06:52 INFO mapred.JobClient:     Combine input records=0
15/11/05 09:06:52 INFO mapred.JobClient:     SPLIT_RAW_BYTES=221
15/11/05 09:06:52 INFO mapred.JobClient:     Reduce input records=54
15/11/05 09:06:52 INFO mapred.JobClient:     Reduce input groups=1
15/11/05 09:06:52 INFO mapred.JobClient:     Combine output records=0
15/11/05 09:06:52 INFO mapred.JobClient:     Physical memory (bytes) snapshot=1155571712
15/11/05 09:06:52 INFO mapred.JobClient:     Reduce output records=1
15/11/05 09:06:52 INFO mapred.JobClient:     Virtual memory (bytes) snapshot=7304839168
15/11/05 09:06:52 INFO mapred.JobClient:     Map output records=54
```
Regarding the above example, we can check the data within the input (a single dataset) and the output result:

```
$ hadoop fs -cat /user/acs/devguideidas/temperature/sensor_temp_zuia_20plaza_20kafe_kitchen_thing/sensor_temp_zuia_20plaza_20kafe_kitchen_thing.txt 
{"recvTime":"2015-11-04T14:25:50.723Z","fiware-servicepath":"temperature","entityId":"SENSOR_TEMP_Zuia%20Plaza%20Kafe_Kitchen","entityType":"thing", "temperature":"25", "temperature_md":[{"name":"TimeInstant","type":"ISO8601","value":"2015-11-04T14:25:50.703691"}]}
{"recvTime":"2015-11-04T14:31:56.67Z","fiware-servicepath":"temperature","entityId":"SENSOR_TEMP_Zuia%20Plaza%20Kafe_Kitchen","entityType":"thing", "temperature":"25", "temperature_md":[{"name":"TimeInstant","type":"ISO8601","value":"2015-11-04T14:31:56.047151"}]}
...
{"recvTime":"2015-11-05T08:49:35.683Z","fiware-servicepath":"temperature","entityId":"SENSOR_TEMP_Zuia%20Plaza%20Kafe_Kitchen","entityType":"thing", "temperature":"23", "temperature_md":[{"name":"TimeInstant","type":"ISO8601","value":"2015-11-05T08:49:35.676288"}]}
{"recvTime":"2015-11-05T09:08:22.14Z","fiware-servicepath":"temperature","entityId":"SENSOR_TEMP_Zuia%20Plaza%20Kafe_Kitchen","entityType":"thing", "temperature":"25", "temperature_md":[{"name":"TimeInstant","type":"ISO8601","value":"2015-11-05T09:08:22.004183"}]}
```
```
$ hadoop fs -cat /user/acs/output/sensor_temp_zuia_20plaza_20kafe_kitchen_thing/part-r-00001
30.0 18.0 23.814816 6.92865
```

##<a name="section3"></a>Contact
Francisco Romero Bueno (francisco.romerobueno@telefonica.com)
