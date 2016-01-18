#!/bin/bash
# subscription-occupancy-levels.sh
# Copyright(c) 2016 Bitergia
# Author: Alberto Martín <amartin@bitergia.com>
# MIT Licensed
#
# OccupancyLevels displayed in restaurants subscription

CYGNUS_HOST=$( hostname -i )
CYGNUS_PORT=5003
CYGNUS_URL=http://${CYGNUS_HOST}:${CYGNUS_PORT}/notify
ORION_URL=http://${ORION_HOSTNAME}:${ORION_PORT}/v1/subscribeContext

cat <<EOF | curl ${ORION_URL} -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: tourguide' --header 'Fiware-ServicePath: /' -d @-
{
    "entities": [
        {
            "type": "PropertyValue",
            "isPattern": "false",
            "id": "occupancyLevels"
        }
    ],
    "attributes": [
        "value"
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
