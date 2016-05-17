# misc

## oauthToken.js

Simple Node.js script that retrieves a fresh token from IDM-Keyrock to allow users make requests against the [FIWARE TourGuide RESTful API](http://docs.tourguide.apiary.io)

### Usage:

```
node oauthToken.js <username> <password>
```

### Output:

```
{"access_token": "BfzpBf7rW5jVKcOJWhTmpdoNuK39IK", "token_type": "Bearer", "expires_in": 3600, "refresh_token": "TRBoiufwxh3FTAC6PBYnzVMA32k5n0"}
```

Also, you can run it from inside the container in a Docker environment:

```
docker exec -i -t compose_tourguide_1 node tutorials.TourGuide-App/server/misc/oauthToken.js <username> <password>
```
