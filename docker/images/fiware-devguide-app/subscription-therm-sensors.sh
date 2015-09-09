#!/bin/bash

DEVGUIDE_HOST=$( hostname -i )
DEVGUIDE_URL=http://${DEVGUIDE_HOST}/api/orion/temperature/
ORION_URL=http://${ORION_NO_PROXY_HOSTNAME}:${ORION_PORT}/NGSI10/subscribeContext

# IDAS temperature sensors used in restaurants
cat <<EOF | curl ${ORION_URL} -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' -d @-
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
    "reference": "${DEVGUIDE_URL}",
    "duration": "P1M",
    "notifyConditions": [
        {
            "type": "ONCHANGE",
            "condValues": [
                "TimeInstant"
            ]
        }
    ],
    "throttling": "PT1S"
}
EOF
