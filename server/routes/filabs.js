/*
 * ChanChan Auth REST API
 */

var utils = require('../utils');
// var filabs_url = "cloud.lab.fi-ware.org";
var filabs_url = "orion.lab.fiware.org";

// Return the access token for a user
exports.auth = function(req, res) {
    return_post = function(res, buffer, headers) {
        try {
            // var data = JSON.parse(buffer);
            // var token = data.access.token.id;
            var token = buffer;
            res.send(token);
        } catch (e) {
            res.status(403);
            res.send(buffer);
        };
    };

    var auth_data = req.params.auth_data;
    var user = auth_data.split("&")[0];
    var password = auth_data.split("&")[1];

    var post_data = {
        "username":user,
        "password":password
    };

    post_data = JSON.stringify(post_data);

    console.log(post_data);

    var headers = {
        "Content-type":"application/json"
    };

    var options = {
        host: filabs_url,
        path: '/token',
        method: 'POST',
        headers: headers
    };

    var use_https = true;
    utils.do_post(options, post_data, return_post, res, use_https);
};
