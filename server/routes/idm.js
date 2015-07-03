/*
 * ChanChan Auth REST API
 */

var utils = require('../utils');
var idm_url = "idm";
var idm_port = "5000";

// Return the access token for a user
exports.auth = function(req, res) {
    return_post = function(res, buffer, headers) {
        try {
            // In the headers we have the token
            var token = headers['x-subject-token'];
            // In the buffer we have what can be done with the token
            var token_info = buffer;
            token_info = JSON.parse(buffer);
            // Add token value to the JSON fields
            token_info.value = token;
            res.send(JSON.stringify(token_info));
        } catch (e) {
            console.log(e);
            res.status(403);
            res.send(buffer);
        };
    };

    var params = req.params.auth_data.split("&");
    var user = params[0].split("=")[1];
    var password = params[1].split("=")[1];
    var organization = params[2].split("=")[1];

    var key_stone_identity = ' \
        "identity": { \
            "methods": ["password"], \
            "password": { \
              "user": { \
                "name": "'+user+'" , \
                "domain": { "id": "default" }, \
                "password": "'+password+'" \
              } \
            } \
          } \
    ';

    var key_stone_scope = ' \
        "scope": { \
            "project": { \
              "name": "'+organization+'", \
              "domain": { "id": "default" } \
            } \
          } \
    ';

    var key_stone_query = '\
        {"auth": { \
             '+key_stone_identity+'\
            ,'+key_stone_scope+' \
        } \
      }';

    console.log(key_stone_query);

    var headers = {
        'Content-Type': 'application/json'
    };

    var options = {
        host: idm_url,
        // path: '/oauth2/token',
        path: '/v3/auth/tokens',
        method: 'POST',
        headers: headers,
        port: idm_port
    };

    var use_https = false;
    utils.do_post(options, key_stone_query, return_post, res, use_https);
};


// Return the access token for an app for a user
exports.auth_pep = function(req, res) {
    return_post = function(res, buffer, headers) {
        try {
            var token = buffer;
            res.send(token);
        } catch (e) {
            console.log(e);
            res.status(403);
            res.send(buffer);
        };
    };

    var params = req.params.auth_data.split("&");
    var user = params[0].split("=")[1];
    var password = params[1].split("=")[1];
    var client_id = params[2].split("=")[1];
    var client_secret = params[3].split("=")[1];

    var query = "grant_type=password"; // we provide user password
    query += "&username="+user+"&"+"password="+password;
    query += "&client_id="+client_id+"&client_secret="+client_secret;
    query += "&redirect_uri=http://localhost"; // not used
 
    var basic_auth = client_id + ':' + client_secret;
    basic_auth = (new Buffer(basic_auth)).toString('base64');

    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + basic_auth,
        'Content-length': query.length
    };

    var options = {
        host: idm_url,
        path: '/oauth2/token',
        method: 'POST',
        headers: headers
    };

    var use_https = true;
    utils.do_post(options, query, return_post, res, use_https);
};