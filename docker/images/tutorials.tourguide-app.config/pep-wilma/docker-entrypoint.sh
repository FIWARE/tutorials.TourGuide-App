#!/bin/bash

export DEBIAN_FRONTEND=noninteractive
apt-get install -y --no-install-recommends curl
source /tourguide/common/entrypoint-common.sh

declare DOMAIN=''

function get_domain () {

    if [ $# -lt 2 ] ; then
        echo "check_host_port: missing parameters."
        echo "Usage: check_host_port <host> <port> [max-tries]"
        exit 1
    fi

    local _host=$1
    local _port=$2

    # Request to Authzforce to retrieve Domain

    DOMAIN=$( curl -s --request GET http://${_host}:${_port}/${AUTHZFORCE_BASE_PATH}/domains | awk '/href/{print $NF}' | cut -d '"' -f2 )
    echo "Domain retrieved: $DOMAIN"

}

# Configure Domain permissions to user 'pepproxy' at IdM.
# TODO: make it more configurable

function domain_permissions() {

    local _host=$1
    local _port=$2

    FRESHTOKEN=$( curl -s -i   -H "Content-Type: application/json"   -d '{ "auth": {"identity": {"methods": ["password"], "password": { "user": { "name": "idm", "domain": { "id": "default" }, "password": "idm"} } } } }' http://${_host}:${_port}/v3/auth/tokens | grep ^X-Subject-Token: | awk '{print $2}' )
    MEMBERID=$( curl -s -H "X-Auth-Token:${FRESHTOKEN}" -H "Content-type: application/json" http://${_host}:${_port}/v3/roles | python -m json.tool | grep -iw id | awk -F'"' '{print $4}' | head -n 1 )
    REQUEST=$( curl -s -X PUT -H "X-Auth-Token:${FRESHTOKEN}" -H "Content-type: application/json" http://${_host}:${_port}/v3/domains/default/users/pepproxy/roles/${MEMBERID} )
    echo "User pepproxy has been granted with:"
    echo "Role: ${MEMBERID}"
    echo "Token:  ${FRESHTOKEN}"

}

if [ $# -eq 0 -o "${1:0:1}" = '-' ] ; then

    check_var WILMA_HOME /opt/fiware-pep-proxy
    check_var WILMA_USER pepproxy
    check_var PEP_RELEASE 5.1

    check_var AUTHZFORCE_HOSTNAME authzforce
    check_var AUTHZFORCE_PORT 8080
    check_var AUTHZFORCE_VERSION 4.4.1b
    case "${AUTHZFORCE_VERSION}" in
        "4.2.0")
            check_var AUTHZFORCE_BASE_PATH authzforce
            ;;
        *)
            check_var AUTHZFORCE_BASE_PATH authzforce-ce
            ;;
    esac
    check_var IDM_KEYSTONE_HOSTNAME idm
    check_var IDM_KEYSTONE_PORT 5000
    check_var APP_HOSTNAME orion
    check_var APP_PORT 1026
    check_var PEP_USERNAME pepproxy@test.com
    check_var PEP_PASSWORD test
    check_var PEP_PORT 1026
    check_var IDM_USERNAME user0@test.com
    check_var IDM_USERPASS test
    check_var MAGIC_KEY daf26216c5434a0a80f392ed9165b3b4

    # fix variables when using docker-compose
    if [[ ${AUTHZFORCE_PORT} =~ ^tcp://[^:]+:(.*)$ ]] ; then
        export AUTHZFORCE_PORT=${BASH_REMATCH[1]}
    fi
    if [[ ${IDM_KEYSTONE_PORT} =~ ^tcp://[^:]+:(.*)$ ]] ; then
        export IDM_KEYSTONE_PORT=${BASH_REMATCH[1]}
    fi
    if [[ ${APP_PORT} =~ ^tcp://[^:]+:(.*)$ ]] ; then
        export ORION_PORT=${BASH_REMATCH[1]}
    fi

    # Call checks

    check_file /config/domain-ready || exit 1
    get_domain ${AUTHZFORCE_HOSTNAME} ${AUTHZFORCE_PORT}
    check_file /config/provision-ready || exit 1
    check_host_port ${IDM_KEYSTONE_HOSTNAME} ${IDM_KEYSTONE_PORT}
    domain_permissions ${IDM_KEYSTONE_HOSTNAME} ${IDM_KEYSTONE_PORT}

    cp /tourguide/pep-wilma/auth-token.sh /usr/local/bin/auth-token.sh
    chmod 755 /usr/local/bin/auth-token.sh

    # Configure PEP Proxy config.js

    cd ${WILMA_HOME}
    git checkout ${PEP_RELEASE}
    npm install
    cp /tourguide/pep-wilma/config.js ${WILMA_HOME}/config.js
    sed -i ${WILMA_HOME}/config.js \
        -e "s|PEP_PORT|${PEP_PORT}|g" \
        -e "s|IDM_KEYSTONE_HOSTNAME|${IDM_KEYSTONE_HOSTNAME}|g" \
        -e "s|IDM_KEYSTONE_PORT|${IDM_KEYSTONE_PORT}|g" \
        -e "s|APP_HOSTNAME|${APP_HOSTNAME}|g" \
        -e "s|APP_PORT|${APP_PORT}|g" \
        -e "s|PEP_USERNAME|${PEP_USERNAME}|g" \
        -e "s|PEP_PASSWORD|${PEP_PASSWORD}|g" \
        -e "s|AUTHZFORCE_HOSTNAME|${AUTHZFORCE_HOSTNAME}|g" \
        -e "s|AUTHZFORCE_PORT|${AUTHZFORCE_PORT}|g" \
        -e "s|AUTHZFORCE_BASE_PATH|${AUTHZFORCE_BASE_PATH}|g" \
        -e "s|DOMAIN|${DOMAIN}|g" \
        -e "s|MAGIC_KEY|${MAGIC_KEY}|g"

    # Create PEP user
    adduser --disabled-password --gecos "${WILMA_USER}" ${WILMA_USER}

    # Install forever
    npm install forever --global

    # Start PEP Proxy
    cd ${WILMA_HOME}
    su - ${WILMA_USER} -c "cd ${WILMA_HOME} ; PORT=${PEP_PORT} NODE_ENV=development forever start server.js"
    exec su - ${WILMA_USER} -c "forever --fifo logs 0"
else
    exec "$@"
fi
