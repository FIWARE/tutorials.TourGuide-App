#!/bin/bash

HOSTS="/etc/hosts"
NEW_HOST=""
PUBLIC_IP=`hostname -i`

function update_docker_hosts_file () {

    local _public_ip=$1
    local _new_host=$2

    # docker does not allow replacing the /etc/hosts file, so 'sed -i'
    # does not work inside the container, as it creates a new file and
    # then tries to replace the original file after doing the
    # substitutions.  Instead, we need to edit the already existing
    # file without replacing it.

    cat "${HOSTS}" | sed -e "s/^${_public_ip}.*$/& ${_new_host}/" > /tmp/update_hosts.txt
    cat /tmp/update_hosts.txt > "${HOSTS}"
    rm /tmp/update_hosts.txt
}

function update_hosts_file () {

    local _public_ip=$1
    local _new_host=$2

    sed -i "${HOSTS}" -e "s/^${_public_ip}.*$/& ${_new_host}/"
}

function update_hosts () {

    local _public_ip=$1
    local _new_host=$2

    if $( ${SCRIPTS_PATH}/util/check_docker.sh ) ; then
	update_docker_hosts_file "${_public_ip}" "${_new_host}"
    else
	update_hosts_file "${_public_ip}" "${_new_host}"
    fi
}

# exit if no host specified
if [ -z $1 ]; then
    echo "No host specified"
    exit 1
else
    NEW_HOST="$1"
fi

if [ -z ${PUBLIC_IP} ]; then
    echo "Failed to get public IP for iface ${PUBLIC_IFACE}"
    exit 1
fi

if [ "${NEW_HOST}" == "${HOSTNAME}" ]; then
    # line already set
    exit 0
fi

# test if host is already set
grep -q "^${PUBLIC_IP}.*[ 	]${NEW_HOST}\([ 	]\+\|$\)" "${HOSTS}"

if [ $? -eq 0 ]; then
    echo "Host ${NEW_HOST} is already set"
    exit 0
else
    # test if there's a line for the public IP
    grep -q "^${PUBLIC_IP}[ 	]" "${HOSTS}"

    if [ $? -eq 0 ]; then
	# add the new host to the existing line
	update_hosts "${PUBLIC_IP}" "${NEW_HOST}"
    else
	echo "${PUBLIC_IP} ${NEW_HOST}" >> "${HOSTS}"
    fi
fi
