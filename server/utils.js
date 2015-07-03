/*
 * ChanChan Utils
 */

http = require('http');
https = require('https');

exports.do_get = function (options, callback, res) {
    var request = http.get(options, function (response) {
        // data is streamed in chunks from the server
        // so we have to handle the "data" event
        var buffer = "", data;

        response.on("data", function (chunk) {
            buffer += chunk;
        });

        response.on("end", function (err) {
            var msg = "";
            try {
                data = JSON.parse(buffer);
                console.log(data);
            } catch (err) {
                console.log("Can't decode JSON response.");
                console.log(err);
                msg = "Can't decode JSON response.";
            }
            if (data == undefined) {
                msg = "Error processing JSON response";
            }
            else {
                msg = buffer;
            }
            callback(res, msg);
        });
    });
    request.on('error', function(err) {
        console.log("FAILED GET REQUEST");
        var err = new Error();
        err.status = 502; // Bad gateway
        callback(res, err);
        console.log(err);
    }); 
};

exports.do_post = function (options, data, callback, res, use_https) {

    console.log("In DO POST");

    console.log(options);

    try {
        var protocol = http;
        if (use_https) {protocol = https};
        var post_req = protocol.request(options, function(response) {
            console.log("DOING POST");

            response.setEncoding('utf8');

            var buffer = "";

            response.on('data', function (chunk) {
                buffer += chunk;

            });

            response.on("end", function (err) {
                console.log(buffer);
                callback(res, buffer, response.headers);
            });
        });

        console.log("POST Request created");

        post_req.on('error', function(e) {
            // TODO: handle error.
            callback(res, e);
            console.log(e);
          });

        // post the data
        post_req.write(data);

        post_req.end();

    } catch (error) {
        callback(res, error);
        console.log(error);
    }
};