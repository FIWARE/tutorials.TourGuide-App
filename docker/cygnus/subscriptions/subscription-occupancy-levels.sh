#!/bin/bash

exit 0

CYGNUS_HOST=$( hostname -i )
CYGNUS_PORT=5003
CYGNUS_URL=http://${CYGNUS_HOST}:${CYGNUS_PORT}/notify
ORION_URL=http://${ORION_HOSTNAME}:${ORION_PORT}/v1/subscribeContext

# OccupancyLevels displayed in restaurants
cat <<EOF | curl ${ORION_URL} -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: devguide' --header 'Fiware-ServicePath: /' -d @-
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
