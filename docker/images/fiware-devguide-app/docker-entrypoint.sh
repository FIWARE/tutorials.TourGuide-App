#!/bin/bash

[ -z "${IDM_HOSTNAME}" ] && echo "IDM_HOSTNAME is undefined.  Using default value of 'idm'" && export IDM_HOSTNAME=idm
[ -z "${IDM_PORT}" ] && echo "IDM_PORT is undefined.  Using default value of '5000'" && export IDM_PORT=443
[ -z "${DEFAULT_MAX_TRIES}" ] && echo "DEFAULT_MAX_TRIES is undefined.  Using default value of '30'" && export DEFAULT_MAX_TRIES=30

if [[ ${IDM_PORT} =~ ^tcp://[^:]+:(.*)$ ]] ; then
    export IDM_PORT=${BASH_REMATCH[1]}
fi

IDM_CONFIG="/config/idm2chanchan.json" 
CC_SERVER_PATH="fiware-devguide-app/server"

function check_host_port () {

    local _timeout=10
    local _tries=0
    local _is_open=0

    if [ $# -lt 2 ] ; then
    echo "check_host_port: missing parameters."
    echo "Usage: check_host_port <host> <port> [max-tries]"
    exit 1
    fi

    local _host=$1
    local _port=$2
    local _max_tries=${3:-${DEFAULT_MAX_TRIES}}
    local NC=$( which nc )

    if [ ! -e "${NC}" ] ; then
    echo "Unable to find 'nc' command."
    exit 1
    fi

    echo "Testing if port '${_port}' is open at host '${_host}'."

    while [ ${_tries} -lt ${_max_tries} -a ${_is_open} -eq 0 ] ; do
    echo -n "Checking connection to '${_host}:${_port}' [try $(( ${_tries} + 1 ))/${_max_tries}] ... "
    if ${NC} -z -w ${_timeout} ${_host} ${_port} ; then
        echo "OK."
        _is_open=1
    else
        echo "Failed."
        sleep 1
        _tries=$(( ${_tries} + 1 ))
    fi
    done

    if [ ${_is_open} -eq 0 ] ; then
    echo "Failed to connect to port '${_port}' on host '${_host}' after ${_tries} tries."
    echo "Port is closed or host is unreachable."
    exit 1
    else
    echo "Port '${_port}' at host '${_host}' is open."
    fi
}

function configure_params () {

     # get the desired values
    CLIENT_ID="$(grep -Po '(?<="id": ")[^"]*' ${IDM_CONFIG})"
    CLIENT_SECRET="$(grep -Po '(?<="secret": ")[^"]*' ${IDM_CONFIG})"

    # parse it into the config.js file
    sed -i ${CC_SERVER_PATH}/config.js \
        -e "s|IDM_HOSTNAME|${IDM_HOSTNAME}|g" \
        -e "s|CLIENT_ID|${CLIENT_ID}|g" \
        -e "s|CLIENT_SECRET|${CLIENT_SECRET}|g"
}

# Call checks
echo ${IDM_HOSTNAME} ${IDM_PORT}
check_host_port ${IDM_HOSTNAME} ${IDM_PORT} 
configure_params

# Start container back

exec /sbin/init
