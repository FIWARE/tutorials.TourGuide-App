#!/bin/bash

if [ $# -lt 2 ] ; then
    echo "auth-token: missing parameters."
    echo "Usage: auth-token <user-email> <password>"
    exit 1
fi

# Retrieve X-Auth-Token to make request against the protected resource

function get_token () {

    if [ $# -lt 2 ] ; then
    echo "get_token: missing parameters."
    echo "Usage: get_token <user-email> <password>"
    exit 1
    fi

    local _user=$1
    local _pass=$2

    # Retrieve Client ID and client Secret Automatically

    CLIENT_ID="$(cat /config/idm2chanchan.json | awk '/id/{print $NF}' | cut -d '"' -f2)"
    CLIENT_SECRET="$(cat /config/idm2chanchan.json | awk '/secret/{print $NF}' | cut -d '"' -f2)"

    # Generate the Authentication Header for the request

    AUTH_HEADER="$(echo -n ${CLIENT_ID}:${CLIENT_SECRET} | base64 -w 0)"

    # Define headers

    CONTENT_TYPE="\"Content-Type: application/x-www-form-urlencoded\""
    AUTH_BASIC="\"Authorization: Basic ${AUTH_HEADER}\""

    # Define data to send

    DATA="'grant_type=password&username=${_user}&password=${_pass}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}'"

    # Create the request

    REQUEST="curl -s --insecure -i --header ${AUTH_BASIC} --header ${CONTENT_TYPE} -X POST https://idm/oauth2/token -d ${DATA}"
    XAUTH_TOKEN="$(eval ${REQUEST} | grep -Po '(?<="access_token": ")[^"]*')"
    echo "X-Auth-Token for '${_user}': ${XAUTH_TOKEN}"
    
}

get_token $1 $2
