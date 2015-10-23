# Copyright (C) 2015 Bitergia
# GPLv3 License

FROM bitergia/ubuntu-trusty:latest
MAINTAINER Alvaro del Castillo <acs@bitergia.com>

ENV DEBIAN_FRONTEND noninteractive
ENV DEPLOY_USER bitergia
ENV DEPLOY_USER_DIR /home/${DEPLOY_USER}
ENV SUBSCRIPTIONS_PATH /opt/subscribe

ENV CC_APP_SERVER_PATH ${DEPLOY_USER_DIR}/fiware-devguide-app/server

# install dependencies
RUN apt-get update && \
    apt-get -y install --no-install-recommends \
        bash \
        git git-core \
        tree ccze \
        psmisc \
        nodejs nodejs-legacy npm \
        apache2 libapache2-mod-passenger \
        mysql-client \
        && \
    apt-get clean && \
    find /var/lib/apt/lists -type f -delete

# hack to fix nodejs support on ubuntu/debian passenger package
# if [ ! -d "/usr/share/passenger/node_lib" ] ; then
RUN mkdir fix-node-passenger && \
    cd fix-node-passenger && \
    apt-get update && \
    apt-get install -qy dpkg-dev && \
    sed -e 's/^deb /deb-src /g' /etc/apt/sources.list >> /etc/apt/sources.list.d/debsrc.list && \
    apt-get update && \
    apt-get source ruby-passenger && \
    version=$( ls ruby-passenger*.orig.tar.gz | sed -e 's/^ruby-passenger_\(.*\).orig.tar.gz$/\1/' ) && \
    cp -r ${PWD}/ruby-passenger-${version}/node_lib /usr/share/passenger/ && \
    cd .. && \
    rm -rf fix-node-passenger && \
    mkdir ${SUBSCRIPTIONS_PATH}
# fi

COPY subscription-therm-sensors.sh ${SUBSCRIPTIONS_PATH}/

# enable modules, disable default site, restart service
RUN a2enmod ssl && a2enmod passenger && \
    a2dissite 000-default

# install grunt-cli to be able to run the tasks inside the container
RUN npm install --loglevel warn -g grunt-cli

USER ${DEPLOY_USER}
WORKDIR ${DEPLOY_USER_DIR}

# get repository
RUN git clone https://github.com/Bitergia/fiware-devguide-app.git fiware-devguide-app

# server
RUN cd ${CC_APP_SERVER_PATH} && \
    npm install --loglevel warn

# Add the IdM provision

COPY keystone_provision.py ${DEPLOY_USER_DIR}/keystone_provision.py

USER root

ADD docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod 755 /docker-entrypoint.sh
ADD https://raw.githubusercontent.com/Bitergia/docker/master/utils/entrypoint-common.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
