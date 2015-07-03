var config = {}

// URL to the FI-WARE Identity Management GE
// default: https://account.lab.fi-ware.org
config.idm_url = 'https://idm.server';

// Oauth2 configuration
// Found on the application profile page after registering
// the application on the FI-WARE Identity Management GE

// Client ID for the application
config.client_id = '';

// Client Secret for the application
config.client_secret = ''

// Callback URL for the application
config.callback_url = 'http://chanchan.server/login'


module.exports = config;
