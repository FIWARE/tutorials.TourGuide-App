FROM mongo:2.6

COPY devguide-data.tar.gz /data/devguide-data.tar.gz
RUN sed -i /entrypoint.sh -e '/set -e/a if [ ! -f /data/db/local.0 ] ; then echo "Setting up preloaded database"; tar zxvf /data/devguide-data.tar.gz -C /data/db/ ; fi'
