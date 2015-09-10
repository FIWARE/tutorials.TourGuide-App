/*
 * ChanChan Utils
 */

http = require('http');
https = require('https');

exports.do_get = function (options, callback, res, use_https) {
    var protocol = http;
    if (use_https) {protocol = https};

    var request = protocol.get(options, function (response) {
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
                // console.log(data);
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

    try {
        var protocol = http;
        if (use_https) {protocol = https};

        var post_req = protocol.request(options, function(response) {
            // console.log("DOING POST");

            response.setEncoding('utf8');

            var buffer = "";

            response.on('data', function (chunk) {
                buffer += chunk;

            });

            response.on("end", function (err) {
                // console.log(buffer);
                callback(res, buffer, response.headers);
            });
        });

        // console.log("POST Request created");

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

exports.replaceOnceUsingDictionary = function (dictionary, content, replacehandler) {
    if (typeof replacehandler != "function") {
        // Default replacehandler function.
        replacehandler = function(key, dictionary){
            return dictionary[key];
        }
    }
    
    var patterns = [], // \b is used to mark boundaries "foo" doesn't match food
        patternHash = {},
        oldkey, key, index = 0,
        output = [];
    for (key in dictionary) {
        // Case-insensitivity:
        key = (oldkey = key).toLowerCase();
        dictionary[key] = dictionary[oldkey];
        
        // Sanitize the key, and push it in the list
        patterns.push('\\b(?:' + key.replace(/([[^$.|?*+(){}])/g, '\\$1') + ')\\b');
        
        // Add entry to hash variable, for an optimized backtracking at the next loop
        patternHash[key] = index++;
    }
    var pattern = new RegExp(patterns.join('|'), 'gi'),
        lastIndex = 0;

    // We should actually test using !== null, but for foolproofness,
    //  we also reject empty strings
    while (key = pattern.exec(content)) {
        // Case-insensitivity
        key = key[0].toLowerCase();

        // Add to output buffer
        output.push(content.substring(lastIndex, pattern.lastIndex - key.length));
        // The next line is the actual replacement method
        output.push(replacehandler(key, dictionary));

        // Update lastIndex variable
        lastIndex = pattern.lastIndex;

        // Don't match again by removing the matched word, create new pattern
        patterns[patternHash[key]] = '^';
        pattern = new RegExp(patterns.join('|'), 'gi');

        // IMPORTANT: Update lastIndex property. Otherwise, enjoy an infinite loop
        pattern.lastIndex = lastIndex;
    }
    output.push(content.substring(lastIndex, content.length));
    return output.join('');
}

exports.randomIntInc = function (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

exports.randomElement = function (elements) {
    return elements[Math.floor(Math.random()*elements.length)]
}

exports.fixedEncodeURIComponent = function (str) {
    str=str.replace(/["]/g,'\\"');
    str=str.replace(/\n/g,'\\n');
    return str.replace(/[<>"'=;()\n\\]/g, function(c) {
    var hex;
    hex = c.charCodeAt( 0 ).toString( 16 );
    return '%' + ((hex.length==2) ? hex : '0' + hex );
    });
}