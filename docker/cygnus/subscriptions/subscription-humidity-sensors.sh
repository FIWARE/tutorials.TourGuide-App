#!/bin/bash

CYGNUS_HOST=$( hostname -i )
CYGNUS_PORT=5001
CYGNUS_URL=http://${CYGNUS_HOST}:${CYGNUS_PORT}/notify
ORION_URL=http://${ORION_NO_PROXY_HOSTNAME}:${ORION_PORT}/v1/subscribeContext

# IDAS humidity sensors used in restaurants
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