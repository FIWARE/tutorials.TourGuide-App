var config = {};

config.pep_port = PEP_PORT;

// Set this var to undefined if you don't want the server to listen on HTTPS
// config.https = {
//    enabled: false,
//    cert_file: 'cert/cert.crt',
//    key_file: 'cert/key.key',
//    port: 443
//};

// Our IdM IP
config.account_host = 'IDM_KEYSTONE_HOSTNAME';

// Our Keystone Settings. In this case Keystone and Horizon are at the same host
config.keystone_host = 'IDM_KEYSTONE_HOSTNAME';
config.keystone_port = IDM_KEYSTONE_PORT;

// The host of the app to protect
config.app_host = 'APP_HOSTNAME';
config.app_port = APP_PORT;

// The username and password we've used for registering the app (just for testing)
config.username = 'PEP_USERNAME';
config.password = 'PEP_PASSWORD';

// in seconds
config.chache_time = 300;

// if enabled PEP checks permissions with AuthZForce GE.
// only compatible with oauth2 tokens engine
config.azf = {
    enabled: true,
    host: 'AUTHZFORCE_HOSTNAME',
    port: AUTHZFORCE_PORT,
    path: '/authzforce/domains/DOMAIN/pdp'
};

// options: oauth2/keystone
config.tokens_engine = 'oauth2';

config.magic_key = 'MAGIC_KEY';

module.exports = config;
