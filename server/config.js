// jshint node: true

var config = {};

// URL to the FI-WARE Identity Management GE
// default: https://account.lab.fi-ware.org
config.idmUrl = 'https://idm';

// Oauth2 configuration
// Found on the application profile page after registering
// the application on the FI-WARE Identity Management GE

// Client ID for the application
config.clientId = '91b29c1f18224d048a10ef0c3317d739';

// Client Secret for the application
config.clientSecret = '9439b19b703c49f399f21df4f89b7c04';

// Callback URL for the application
// TODO: make callback URL configurable as the others
config.callbackUrl = 'http://compose_devguide_1/login';

config.responseType = 'code';

// Fiware service for the app
config.fiwareService = 'devguide';

// Orion
config.orionPort = '1026';
config.orionHostname = 'pepwilma';
config.orionPepEnabled = 'true';

// IDAS
config.idasHostname = 'idas';
config.idasPort = '8080';
config.idasFiwareService = 'devguideidas';
config.idasFiwareServicePath = '/';
config.idasApiKey = 'devguideidas';
// Do not use the pep proxy (yet) for IDAS.
config.idasContextBrokerHostname = 'orion';

module.exports = config;
