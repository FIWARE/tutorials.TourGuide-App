#!/bin/bash
# subscription-humidity-sensors.sh
# Copyright(c) 2016 Bitergia
# Author: David Muriel <dmuriel@bitergia.com>
# MIT Licensed
# 
# IDAS humidity sensors used in restaurants

DEVGUIDE_HOST=$( hostname -i )
DEVGUIDE_URL=http://${DEVGUIDE_HOST}/api/sensors/
ORION_URL=http://${ORION_NO_PROXY_HOSTNAME}:${ORION_PORT}/v1/subscribeContext

cat <<EOF | curl ${ORION_URL} -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: devguideidas' --header 'Fiware-ServicePath: /' -d @-
{
    "entities": [
        {
            "type": "thing",
            "isPattern": "true",
            "id": "SENSOR_HUM_.*"
        }
    ],
    "attributes": [
        "humidity"
    ],
    "reference": "${DEVGUIDE_URL}",
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
