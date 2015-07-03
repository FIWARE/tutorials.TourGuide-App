/*
 * ChanChan Orion REST API
 */

var utils = require('../utils');
var orion_url = "wilmapep"; // should resolve to the correct orion pep host

//Update entities data (temperature)
exports.update_context_temperature = function(req, res) {
  return_post = function(res, buffer, headers) {
      console.log("Sending data " + buffer);
      res.send(buffer);
  };

  var org_id = req.params.org_id;
  var context_id = req.params.context_id;
  var temperature_id = req.params.temperature_id;

  post_data = {
    "contextElements": [
            {
                "type": org_id,
                "isPattern": "false",
                "id": context_id,
                "attributes": [
                {
                    "name": "temperature",
                    "type": "centigrade",
                    "value": temperature_id
                },
                {
                    "name": "pressure",
                    "type": "mmHg",
                    "value": "720"
                }
                ]
            }
        ],
        "updateAction": "APPEND"
    };


  post_data = JSON.stringify(post_data);

  headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': post_data.length,
      'x-auth-token': req.headers['x-auth-token']
  };

  var options = {
      host: orion_url,
      port: 1026,
      path: '/v1/updateContext',
      method: 'POST',
      headers: headers
  };

  utils.do_post(options, post_data, return_post, res);
};


// Return the list of available contexts in Orion
exports.contexts = function(req, res) {
    // TODO: Check auth
    // Is it possible to get all contexts from the API?
    // Right now we get all contexts from a type
    contextType = "Room";


    return_get = function(res, buffer) {
        res.send(buffer);
    };


    var options = {
        host: orion_url,
        port: 1026,
        path: '/NGSI10/contextEntityTypes/'+contextType,
        method: 'GET',
        headers: {
            'accept': 'application/json',
            // 'fiware-service': '',
            // 'fiware-servicepath': '',
            'x-auth-token':''
        }
    };

    utils.do_get(options, return_get, res); 
};

// Update entities in orion_pep
exports.update_entities = function(req, res) {
  return_post = function(res, buffer, headers) {
      res.send(buffer);
  };

  var org_id = req.params.org_id;
  var post_data = JSON.stringify(req.body);

  headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': post_data.length,
      'x-auth-token': req.headers['x-auth-token']
  };

  var options = {
      host: orion_url,
      port: 1026,
      path: '/NGSI10/updateContext',
      method: 'POST',
      headers: headers
  };

  utils.do_post(options, post_data, return_post, res);
};
