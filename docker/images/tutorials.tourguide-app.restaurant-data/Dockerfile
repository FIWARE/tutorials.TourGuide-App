# Copyright(c) 2016 Bitergia
# MIT Licensed

FROM mongo:2.6
MAINTAINER Bitergia <fiware-testing@bitergia.com>

COPY tourguide-data.tar.gz /data/tourguide-data.tar.gz
RUN sed -i /entrypoint.sh -e '/set -e/a if [ ! -f /data/db/local.0 ] ; then echo "Setting up preloaded database"; tar zxvf /data/tourguide-data.tar.gz -C /data/db/ ; fi'
