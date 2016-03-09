#!/bin/bash
# cep-subscription-ul20-temp.sh
# Copyright(c) 2016 Bitergia
# David Muriel <dmuriel@bitergia.com>
# MIT Licensed
#
# IDAS temperature sensors used in ul20 client

CEP_URL=http://compose_cep-proton_1:8080/ProtonOnWebServer/rest/events
ORION_URL=http://${ORION_NO_PROXY_HOSTNAME}:${ORION_PORT}/v1/subscribeContext

cat <<EOF | curl ${ORION_URL} -s -S --header 'Content-Type: application/json' --header 'Accept: application/xml' --header 'Fiware-Service: tourguideul20' --header 'Fiware-ServicePath: /' -d @-
{
    "entities": [
        {
            "type": "thing",
            "isPattern": "true",
            "id": "SENSOR_TEMP_.*"
        }
    ],
    "attributes": [
        "temperature"
    ],
    "reference": "${CEP_URL}",
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
