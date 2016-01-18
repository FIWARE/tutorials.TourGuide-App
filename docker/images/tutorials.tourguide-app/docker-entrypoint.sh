#!/bin/bash
# docker-entrypoint.sh
# Copyright(c) 2016 Bitergia
# Author: Bitergia <fiware-testing@bitergia.com>
# MIT Licensed

source /entrypoint-common.sh

check_var TOURGUIDE_USER
check_var TOURGUIDE_USER_DIR

check_var IDM_HOSTNAME idm
check_var IDM_PORT 5000
check_var CONFIG_FILE /config/idm2chanchan.json

check_var FIWARE_SERVICE tourguide

check_var ORION_HOSTNAME orion
check_var ORION_PORT 1026
check_var ORION_PEP_ENABLED false

check_var IDAS_HOSTNAME idas
check_var IDAS_PORT 8080
check_var IDAS_FIWARE_SERVICE tourguideidas
check_var IDAS_FIWARE_SERVICE_PATH /
check_var IDAS_API_KEY tourguideidas

check_var ORION_SUBSCRIPTIONS_ENABLED true

if [[ ${IDM_PORT} =~ ^tcp://[^:]+:(.*)$ ]] ; then
    export IDM_PORT=${BASH_REMATCH[1]}
fi
if [[ ${ORION_PORT} =~ ^tcp://[^:]+:(.*)$ ]] ; then
    export ORION_PORT=${BASH_REMATCH[1]}
fi
if [[ ${IDAS_PORT} =~ ^tcp://[^:]+:(.*)$ ]] ; then
    export IDAS_PORT=${BASH_REMATCH[1]}
fi

case "${ORION_PEP_ENABLED}" in
    "true")
        echo "Orion PEP Proxy authentication has been ENABLED".
        ;;
    "false")
        echo "Orion PEP Proxy authentication has been DISABLED".
        ;;
    *)
        echo "Unknown value defined for 'ORION_PEP_ENABLED' variable: '${ORION_PEP_ENABLED}'"
        echo "Allowed values are: true, false (false is the default)."
        exit 1
        ;;
esac

DOCROOT="${CC_APP_SERVER_PATH}/public"
VHOST_HTTP="/etc/apache2/sites-available/tourguide-app.conf"
APACHE_LOG_DIR=/var/log/apache2

function _configure_params () {

    # get the desired values
    CLIENT_ID=$( grep -Po '(?<="id": ")[^"]*' ${CONFIG_FILE} )
    CLIENT_SECRET=$( grep -Po '(?<="secret": ")[^"]*' ${CONFIG_FILE} )

    # parse it into the config.js file
    sed -i ${CC_APP_SERVER_PATH}/config.js \
        -e "s|IDM_HOSTNAME|${IDM_HOSTNAME}|g" \
        -e "s|CLIENT_ID|${CLIENT_ID}|g" \
        -e "s|CLIENT_SECRET|${CLIENT_SECRET}|g" \
        -e "s|ORION_HOSTNAME|${ORION_HOSTNAME}|g" \
        -e "s|ORION_PORT|${ORION_PORT}|g" \
        -e "s|ORION_PEP_ENABLED|${ORION_PEP_ENABLED}|g" \
        -e "s|IDAS_HOSTNAME|${IDAS_HOSTNAME}|g" \
        -e "s|IDAS_PORT|${IDAS_PORT}|g" \
        -e "s|IDAS_FIWARE_SERVICE_PATH|${IDAS_FIWARE_SERVICE_PATH}|g" \
        -e "s|IDAS_FIWARE_SERVICE|${IDAS_FIWARE_SERVICE}|g" \
        -e "s|FIWARE_SERVICE|${FIWARE_SERVICE}|g" \
        -e "s|IDAS_API_KEY|${IDAS_API_KEY}|g" \
        -e "s|ORION_NO_PROXY_HOSTNAME|${ORION_NO_PROXY_HOSTNAME}|g"

    sed -i ${VHOST_HTTP} \
        -e "s|IDM_HOSTNAME|${IDM_HOSTNAME}|g"
}

function _setup_vhost_http () {
    # create http virtualhost
    cat <<EOF > ${VHOST_HTTP}
<VirtualHost *:80>
    ServerName IDM_HOSTNAME

    # DocumentRoot [root to your app/public]
    DocumentRoot ${DOCROOT}

    ErrorLog ${APACHE_LOG_DIR}/tourguide-app-error.log
    CustomLog ${APACHE_LOG_DIR}/tourguide-app-access.log combined

    # to avoid errors when using self-signed certificates
    SetEnv NODE_TLS_REJECT_UNAUTHORIZED 0

    # Directory [root to your app./public]
    <Directory ${DOCROOT}>
        Require all granted
    </Directory>
</VirtualHost>
EOF
}

function tail_logs () {
    apache_logs='/var/log/apache2/*.log'
    tail -F ${apache_logs}
}

# Move the provision file to /config to make it available for IdM

mv ${TOURGUIDE_USER_DIR}/keystone_provision.py /config/keystone_provision.py

# Call checks
check_host_port ${IDM_HOSTNAME} ${IDM_PORT}
check_host_port ${ORION_HOSTNAME} ${ORION_PORT}
_setup_vhost_http
check_file ${CONFIG_FILE}
_configure_params
# enable new virtualhosts
a2ensite tourguide-app

# Subscribe to receive temperatures from orion
if [ "${ORION_SUBSCRIPTIONS_ENABLED}" = "true" ] ; then

    echo "Testing if orion is ready at http://${ORION_NO_PROXY_HOSTNAME}:${ORION_PORT}/version"
    check_url http://${ORION_NO_PROXY_HOSTNAME}:${ORION_PORT}/version "<version>.*</version>"

    echo "subscribing to orion"
    for f in $( ls ${SUBSCRIPTIONS_PATH} ) ; do
        "${SUBSCRIPTIONS_PATH}/${f}"
    done
fi

# Start apache server

echo "Starting tourguide"
service apache2 start

# Sensors generation
if [ "${SENSORS_GENERATION_ENABLED}" = "true" ] ; then
    cd ${CC_APP_SERVER_PATH}/feeders
    node sensorsgenerator.js
fi

# Force an update of the sensors data
if [ "${SENSORS_FORCED_UPDATE_ENABLED}" = "true" ] ; then
    cd ${CC_APP_SERVER_PATH}/feeders
    node sensorsupdater.js
fi

tail_logs & _waitpid=$!
wait "${_waitpid}"
