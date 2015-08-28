/*
 * ChanChan auth
 */

var OAuth2 = require('./oauth2').OAuth2;
var config = require('./config');

// Config data from config.js file
var client_id = config.client_id;
var client_secret = config.client_secret;
var idmURL = config.idm_url;
var response_type = config.response_type;
var callbackURL = config.callback_url;

var oauth = new OAuth2(client_id,
                        client_secret,
                        idmURL,
                        '/oauth2/authorize',
                        '/oauth2/token',
                        callbackURL);

// This is the callback url for the application.  The IdM will
// redirect the user here after a successful authentication
exports.login = function(req, res) {
    // Using the access code goes again to the IDM to obtain the access_token
    oauth.getOAuthAccessToken(req.query.code, function (e, results){

        if (results === undefined) {
            res.status(404);
            res.send("Auth token not received in results.");
            console.log("Auth token not received in results.")
        } else {
            // Stores the access_token in a session cookie
            req.session.access_token = results.access_token;

            res.redirect('/');
        }
    });
};


// Redirect the user to the IdM for authentication
exports.auth = function(req, res) {
    var path = oauth.getAuthorizeUrl(response_type);
    res.redirect(path);
};


// Logout from the application
exports.logout = function(req, res) {
    req.session.access_token = undefined;
    res.redirect('/');
};

exports.get_user_data = function(req, res, callback) {
    var url = config.idm_url + '/user/';
    var user = null;
    oauth.get(url, req.session.access_token,
        function(e, response) {
            user = JSON.parse(response);
            callback(user);
        }
    );
};

exports.get_username = function(req, res, callback) {
    var url = config.idm_url + '/user/';
    var user = null;
    oauth.get(url, req.session.access_token,
        function(e, response) {
            user = JSON.parse(response);
            callback(user.displayName);
        }
    );
}
