var config = {}

// URL to the FI-WARE Identity Management GE
// default: https://account.lab.fi-ware.org
config.idm_url = 'https://IDM_HOSTNAME';

// Oauth2 configuration
// Found on the application profile page after registering
// the application on the FI-WARE Identity Management GE

// Client ID for the application
config.client_id = 'CLIENT_ID';

// Client Secret for the application
config.client_secret = 'CLIENT_SECRET'

// Callback URL for the application
// TODO: make callback URL configurable as the others
config.callback_url = 'http://compose_devguide_1/login'

config.response_type = 'code';

// Orion
config.orion_port = 'ORION_PORT'
config.orion_hostname = 'ORION_HOSTNAME'
config.orion_pep_enabled = ORION_PEP_ENABLED

module.exports = config;
