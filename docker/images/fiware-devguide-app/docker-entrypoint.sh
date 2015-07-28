#!/bin/bash

[ -z "${IDM_HOSTNAME}" ] && echo "IDM_HOSTNAME is undefined.  Using default value of 'idm'" && export IDM_HOSTNAME=idm
[ -z "${IDM_PORT}" ] && echo "IDM_PORT is undefined.  Using default value of '5000'" && export IDM_PORT=443
[ -z "${CONFIG_FILE}" ] && echo "CONFIG_FILE is undefined.  Using default value of '/config/idm2chanchan.json'" && export CONFIG_FILE=/config/idm2chanchan.json
[ -z "${DEFAULT_MAX_TRIES}" ] && echo "DEFAULT_MAX_TRIES is undefined.  Using default value of '30'" && export DEFAULT_MAX_TRIES=30

if [[ ${IDM_PORT} =~ ^tcp://[^:]+:(.*)$ ]] ; then
    export IDM_PORT=${BASH_REMATCH[1]}
fi

CC_SERVER_PATH="/home/bitergia/fiware-devguide-app/server"
DOCROOT="${CC_APP_SERVER_PATH}/public"
VHOST_HTTP="/etc/apache2/sites-available/devguide-app.conf"
APACHE_LOG_DIR=/var/log/apache2

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

function check_file () {

    local _tries=0
    local _is_available=0

    local _file=$1
    local _max_tries=${3:-${DEFAULT_MAX_TRIES}}

    echo "Testing if file '${_file}' is available."

    while [ ${_tries} -lt ${_max_tries} -a ${_is_available} -eq 0 ] ; do
    echo -n "Checking file '${_file}' [try $(( ${_tries} + 1 ))/${_max_tries}] ... "
    if [ -r ${_file} ] ; then
        echo "OK."
        _is_available=1
    else
        echo "Failed."
        sleep 1
        _tries=$(( ${_tries} + 1 ))
    fi
    done

    if [ ${_is_available} -eq 0 ] ; then
    echo "Failed to to retrieve '${_file}' after ${_tries} tries."
    echo "File is unavailable."
    exit 1
    else
    echo "File '${_file}' is available."
    fi
}

function _configure_params () {

     # get the desired values
    CLIENT_ID="$(grep -Po '(?<="id": ")[^"]*' ${CONFIG_FILE})"
    CLIENT_SECRET="$(grep -Po '(?<="secret": ")[^"]*' ${CONFIG_FILE})"

    # parse it into the config.js file
    sed -i ${CC_SERVER_PATH}/config.js \
        -e "s|IDM_HOSTNAME|${IDM_HOSTNAME}|g" \
        -e "s|CLIENT_ID|${CLIENT_ID}|g" \
        -e "s|CLIENT_SECRET|${CLIENT_SECRET}|g"
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

    ErrorLog ${APACHE_LOG_DIR}/devguide-app-error.log
    CustomLog ${APACHE_LOG_DIR}/devguide-app-access.log combined

    # to avoid errors when using self-signed certificates
    SetEnv NODE_TLS_REJECT_UNAUTHORIZED 0

    # Directory [root to your app./public]
    <Directory ${DOCROOT}>
        Require all granted
    </Directory>
</VirtualHost>
EOF
}

# Call checks
echo ${IDM_HOSTNAME} ${IDM_PORT}
check_host_port ${IDM_HOSTNAME} ${IDM_PORT} 
_setup_vhost_http
check_file ${CONFIG_FILE}
_configure_params
# enable new virtualhosts
a2ensite devguide-app

# Start container back

exec /sbin/init
