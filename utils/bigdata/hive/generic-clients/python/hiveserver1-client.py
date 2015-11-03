#!/usr/bin/env python
# -*- coding: utf-8 -*-

# author: Francisco Romero Bueno francisco.romerobueno@telefonica.com

# imports
import sys
import hive_utils
from hive_service.ttypes import HiveServerException

# get the input parameters
if len(sys.argv) != 6:
    print 'Usage: python hiveserver1-client.py <hive_host> <hive_port> <db_name> <hadoop_user> <hadoop_password>'
    sys.exit()

hiveHost = sys.argv[1]
hivePort = sys.argv[2]
dbName = sys.argv[3]
hadoopUser = sys.argv[4]
hadoopPassword = sys.argv[5]

# do the connection
client = hive_utils.HiveClient(server=hiveHost,
                               port=hivePort,
                               db=dbName)

# create a loop attending HiveQL queries
while (1):
    query = raw_input('remotehive> ')

    try:
        if not query:
            continue

        if query == 'exit':
            sys.exit()

        # execute the query
        for row in client.execute(query):
            print row

    except HiveServerException, ex:
            print ex.message

