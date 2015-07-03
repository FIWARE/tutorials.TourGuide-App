/*
 * ChanChan auth
 */

var OAuth2 = require('oauth').OAuth2;
var config = require('./config');

var oauth = new OAuth2(
    config.client_id,
    config.client_secret,
    config.idm_url,
    '/oauth2/authorize',
    '/oauth2/token'
);

// This is the callback url for the application.  The IdM will
// redirect the user here after a successful authentication
exports.login = function(req, res) {
    oauth.getOAuthAccessToken(
	req.query.code,
	{"grant_type": "authorization_code",
	 "redirect_uri": config.callback_url},
	function(e, token, refresh, results) {
	    console.log('token: ', token);
	    console.log('refresh: ', refresh);
	    console.log('results: ', results);
	    // store the access token on the session
	    if (results !== undefined) {
	        req.session.access_token = results.access_token;
	    }
	    res.redirect('/');
	});
};


// Redirect the user to the IdM for authentication
exports.auth = function(req, res) {
    var redirect_path = oauth.getAuthorizeUrl(
	{response_type: "code"});
    console.log("redirect_path: ", redirect_path);
    res.redirect(redirect_path);
};


// Logout from the application
exports.logout = function(req, res) {
    req.session.access_token = null;
    res.redirect('/');
};

exports.get_user_data = function(req, res) {
    var url = config.idm_url + '/user/';
    var user = null;
    oauth.get(url,
	      req.session.access_token,
	      function(e, response) {
		  user = JSON.parse(response);
	      }
	     );
};

exports.get_username = function(req, res, callback) {
    var url = config.idm_url + '/user/';
    var user = null;
    oauth.get(url,
	      req.session.access_token,
	      function(e, response) {
		  user = JSON.parse(response);
		  callback(user.displayName);
	      }
	     );
}
