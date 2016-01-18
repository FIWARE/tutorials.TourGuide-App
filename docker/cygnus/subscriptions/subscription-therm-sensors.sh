#!/bin/bash
# subscription-therm-sensors.sh
# Copyright(c) 2016 Bitergia
# Author: Alvaro del Castillo <acs@bitergia.com>,
# Alberto Martín <amartin@bitergia.com>
# MIT Licensed
#
# Restaurant temperature sensors subscription

CYGNUS_HOST=$( hostname -i )
CYGNUS_PORT=5001
CYGNUS_URL=http://${CYGNUS_HOST}:${CYGNUS_PORT}/notify
ORION_URL=http://${ORION_HOSTNAME}:${ORION_PORT}/v1/subscribeContext

cat <<EOF | curl ${ORION_URL} -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: tourguideidas' --header 'Fiware-ServicePath: /' -d @-
{
    "entities": [
        {
            "type": "thing",
            "isPattern": "true",
            "id": "SENSOR_TEMP_*"
        }
    ],
    "attributes": [
        "temperature"
    ],
    "reference": "${CYGNUS_URL}",
    "duration": "P1M",
    "notifyConditions": [
        {
            "type": "ONCHANGE",
            "condValues": [
                "TimeInstant"
            ]
        }
    ]
}
EOF
