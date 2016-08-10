# Copyright(c) 2016 Bitergia
# MIT Licensed

FROM ubuntu:14.04
MAINTAINER Bitergia <fiware-testing@bitergia.com>

ENV DEBIAN_FRONTEND noninteractive
ENV INITRD no

ENV TOURGUIDE_USER tourguide
ENV TOURGUIDE_USER_DIR /home/${TOURGUIDE_USER}
ENV GIT_URL_TOURGUIDE https://github.com/Fiware/tutorials.TourGuide-App.git
ENV GIT_REV_TOURGUIDE develop
ENV SUBSCRIPTIONS_PATH /opt/subscribe
ENV CC_APP_SERVER_PATH ${TOURGUIDE_USER_DIR}/tutorials.TourGuide-App/server

# create tourguide user
RUN adduser --disabled-password --gecos "${TOURGUIDE_USER}" ${TOURGUIDE_USER}

# install dependencies
RUN apt-get update && \
    apt-get -y install --no-install-recommends \
        bash curl ca-certificates \
        git git-core \
        tree ccze \
        psmisc \
        nodejs nodejs-legacy npm \
        apache2 libapache2-mod-passenger \
        mysql-client \
        && \
    # update node to latest stable
    npm install -g n && \
    n stable && \
    # remove ubuntu node packages, as they're not needed anymore
    apt-get -y purge nodejs nodejs-legacy npm && \
    # clean shell command hash table
    hash -r && \
    # update npm
    npm install -g npm && \
    # hack to fix nodejs support on ubuntu/debian passenger package
    mkdir fix-node-passenger && \
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
    mkdir ${SUBSCRIPTIONS_PATH} && \
    # enable apache modules and disable default site
    a2enmod ssl && \
    a2enmod passenger && \
    a2dissite 000-default && \
    # install grunt-cli to be able to run the tasks inside the container
    npm install --loglevel warn -g grunt-cli && \
    # cleanup to thin the final image
    apt-get clean && \
    apt-get purge -y dpkg-dev && \
    apt-get autoremove --purge -y && \
    find /var/lib/apt/lists -type f -delete && \
    rm -fr /root/.npm

# setup tourguide app as $TOURGUIDE_USER
USER ${TOURGUIDE_USER}
WORKDIR ${TOURGUIDE_USER_DIR}

# get the repository from git and install node dependencies
RUN git clone -b ${GIT_REV_TOURGUIDE} ${GIT_URL_TOURGUIDE} && \
    cd ${CC_APP_SERVER_PATH} && \
    npm install --loglevel warn && \
    rm -fr ${TOURGUIDE_USER_DIR}/.npm

# copy default subscriptions
COPY cpr-registration.sh ${SUBSCRIPTIONS_PATH}/

# Switch back to root for docker-entrypoint.sh
USER root
ADD docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ADD https://raw.githubusercontent.com/Bitergia/docker/master/utils/entrypoint-common.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
