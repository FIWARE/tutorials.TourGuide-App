/*
 * ChanChan auth
 */
'use strict';
var OAuth2 = require('./oauth2').OAuth2;
var config = require('./config');

// Config data from config.js file
var clientId = config.clientId;
var clientSecret = config.clientSecret;
var idmURL = config.idmUrl;
var responseType = config.responseType;
var callbackURL = config.callbackUrl;

var oauth = new OAuth2(clientId,
                        clientSecret,
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
            res.send('Auth token not received in results.');
            console.log('Auth token not received in results.');
        } else {
            // Stores the access_token in a session cookie
            req.session.access_token = results.access_token;

            res.redirect('/');
        }
    });
};


// Redirect the user to the IdM for authentication
exports.auth = function(req, res) {
    var path = oauth.getAuthorizeUrl(responseType);
    res.redirect(path);
};


// Logout from the application
exports.logout = function(req, res) {
    req.session.access_token = undefined;
    res.redirect('/');
};

exports.getUserData = function(req, res, callback) {
    var url = idmURL + '/user/';
    var user = null;
    oauth.get(url, req.session.access_token,
        function(e, response) {
            user = JSON.parse(response);
            callback(user);
        }
    );
};

exports.getUsername = function(req, res, callback) {
    var url = idmURL + '/user/';
    var user = null;
    oauth.get(url, req.session.access_token,
        function(e, response) {
            user = JSON.parse(response);
            callback(user.displayName);
        }
    );
}
