## auth

**Table of Contents**

- [auth.js](#authjs)
- [authrequest.js](#authrequestjs)
- [oauth2.js](#oauth2js)

### auth.js

Contains the functions needed to login, authenticate and validate requests against [Keyrock](http://catalogue.fiware.org/enablers/identity-management-keyrock) using its [Oauth2](http://oauth.net/2/) authentication flow.

### authrequest.js

Module that consumes the Orion [NGSIv2 API](http://telefonicaid.github.io/fiware-orion/api/v2/latest/). It has only one function aware of performing all the calls. The response is returned as a promise using [request-promise](https://github.com/request/request-promise).

### oauth2.js

Allow us to perform all the request needed in `auth.js` following the [Keyrock Oauth2 Authentication flow](http://fiware-idm.readthedocs.io/en/latest/oauth2.html#oauth2-authentication).
