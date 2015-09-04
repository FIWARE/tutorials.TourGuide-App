# Generate devguide-data.tar.gz

Start devguide with a clean database (use mongo:2.6 instead of bitergia/fiware-devguide-restaurant-data:20150728 as the image for mongodbdata container).
Load the data as usual with the restaurant_feeder.js script and any other script neccessary.
Locate the data volume inside /var/lib/docker:
```
docker inspect compose_mongodbdata_1 | grep "/data/db" | grep volume
```
Stop (not kill) the containers.
Generate tar from volume data (i.e.):
```
sudo su -c 'cd /var/lib/docker/volumes/b1679ce59e0d935fdeeeb724cbd3ab9af99fd05a3315623f9c5554b7e168a4a3/_data && tar zcvf /tmp/devguide-data.tar.gz *'
```
Copy/move devguide-data.tar.gz to the same directory of the Dockerfile and change ownership:
```
sudo chown $your_user:$your_user devguide-data.tar.gz
```
Build the image:
```
docker built -t bitergia/fiware-devguide-restaurant-data:$( date "+%Y%m%d" ) .
```
Test the image. If it's ok, push the image:
```
docker push bitergia/fiware-devguide-restaurant-data:$( date "+%Y%m%d" )
```
