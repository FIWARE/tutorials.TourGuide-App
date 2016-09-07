#!/bin/bash
# setup-test-env.sh
# Copyright(c) 2016 Bitergia
# Author: David Muriel <dmuriel@bitergia.com>
# MIT Licensed

_volume_path=/home/tourguide/tutorials.TourGuide-App
pushd $( dirname $0 ) > /dev/null
_local_path=$( dirname $(pwd) )
popd > /dev/null
cd ${_local_path}

_compose_path="."
_yml="${_compose_path}/docker-compose.yml"
test_yml="/tmp/test-docker-compose.yml"

function setup_compose () {
    cp -f "${_yml}" "${test_yml}"
    sed -i "${test_yml}" \
        -e "s/container_name:[ ]\+/container_name: test_/g"

    # setup compose.yml to enable volume on tourguide if not enabled
    sed -i "${test_yml}" \
        -e "$ a\    volumes:\n        - ${_local_path}:${_volume_path}"
}

function start_test_env() {

    local _max_tries=120
    local _started=0
    local _tries=0
    local ret=0

    setup_compose

    # if travis is active
    if [ "$TRAVIS" = "1" ]; then
        docker-compose -f "${test_yml}" -p tests pull
    fi

    # start containers with docker-compose
    docker-compose -f "${test_yml}" -p tests up -d

    # provision keyrock
    pwd
    ./tour-guide --test configure keyrock -w

    # configure oauth
    ./tour-guide --test configure oauth -w

    # wait for tourguide to be ready
    container_name=$( docker-compose -f "${test_yml}" -p tests ps 2>/dev/null | grep test_tourguide | cut -d ' ' -f 1 )
    while [ ${_started} -eq 0 -a ${_tries} -lt ${_max_tries} ]; do
        echo -n "Waiting for tourguide to be ready [try $(( ${_tries} + 1 ))/${_max_tries}]... "
        if ( docker logs ${container_name} 2>&1 | grep -qE "service apache2 reload" ) ; then
            echo "OK."
            _started=1
        else
            sleep 1
            _tries=$(( ${_tries} + 1 ))
            if [ ${_tries} -lt ${_max_tries} ] ; then
                echo "Retrying."
            else
                echo "Failed."
            fi
        fi
    done

    if [ ${_started} -eq 0 ]; then
        echo "Test environment not ready.  Aborting."
        stop_test_env
        ret=1
    else
        echo "Test environment ready."
        ret=0
    fi

    exit ${ret}
}

function stop_test_env() {
    # stop and remove containers
    docker-compose -f "${test_yml}" -p tests kill
    docker-compose -f "${test_yml}" -p tests rm -f -v
    # restore configuration files
    git checkout "server/config.js"
    # remove test_yml
    rm -f "${test_yml}"
    exit 0
}

function dump_docker_logs () {
    if [ "${DUMP_DOCKER_LOGS}" = "true" ] ; then
        containers=( $( docker-compose -f "${test_yml}" -p tests ps 2>/dev/null | awk '{print $1}' | grep tests_ ) )
        for c in "${containers[@]}"; do
            docker logs $c 2>&1 | sed "s/^/$c | /g"
        done
    fi
}

case "${1}" in
    start)
        start_test_env
        ;;
    stop)
        stop_test_env
        ;;
    logs)
        dump_docker_logs
        ;;
    *)
        echo "Unknown command '${1}'"
        exit 1
        ;;
esac
