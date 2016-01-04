#!/bin/bash

ORION_URL=http://${ORION_NO_PROXY_HOSTNAME}:${ORION_PORT}/v1/registry/registerContext
FIWARE_SERVICE="todosincluidos"
FIWARE_SERVICE_PATH="/iot"
CPR_URL="http://hackathon.ttcloud.net:10026/v1"

# IDAS humidity sensors used in restaurants
cat <<EOF | curl ${ORION_URL} -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header "Fiware-Service: ${FIWARE_SERVICE}" --header "Fiware-ServicePath: ${FIWARE_SERVICE_PATH}" -d @-
{
  "contextRegistrations": [
    {
      "entities": [
        {
          "type": "thinkingthing",
          "isPattern": "false",
          "id": "YB6PBL"
        }
      ],
      "attributes": [
        {
          "name": "temperature",
          "type": "",
          "isDomain": "false"
        },
        {
          "name": "humidity",
          "type": "",
          "isDomain": "false"
        },
        {
          "name": "luminance",
          "type": "",
          "isDomain": "false"
        }
      ],
      "providingApplication": "${CPR_URL}"
    }
  ],
  "duration": "P1M"
}
EOF
