var config = {}

// URL to the FI-WARE Identity Management GE
// default: https://account.lab.fi-ware.org
config.idm_url = 'IDM_HOSTNAME';

// Oauth2 configuration
// Found on the application profile page after registering
// the application on the FI-WARE Identity Management GE

// Client ID for the application
config.client_id = 'CLIENT_ID';

// Client Secret for the application
config.client_secret = 'CLIENT_SECRET'

// Callback URL for the application
config.callback_url = 'IDM_HOSTNAME/login'


module.exports = config;
