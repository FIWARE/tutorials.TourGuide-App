'use strict';
/*
 * AJAXRequest.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors:
 *   Jaisiel Santana <jaisiel@gmail.com>
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

  Module that allows to encapsulate the tourguide AJAX resquests.

*/
/*exported AJAXRequest */
var AJAXRequest = (function() {
  function _prepareXHR(method, url, failureCallback) {
    var xhr = new XMLHttpRequest();

    xhr.onerror = function(e) {
      failureCallback(this.response);
    };

    xhr.open(method, url, true);
    xhr.setRequestHeader('Fiware-Service', 'tourguide');

    return xhr;
  }

  function getAjaxRequest(url, successCallback, failureCallback) {
    var xhr = _prepareXHR('GET', url, failureCallback);

    xhr.onload = function(e) {
      if (200 == this.status) {
        successCallback(this.response);
      }
      else {
        failureCallback(this.response);
      }
    };

    xhr.send();
  }

  function deleteAjaxRequest(url, successCallback, failureCallback) {
    var xhr = _prepareXHR('DELETE', url, failureCallback);

    xhr.onload = function(e) {
      if (204 == this.status) {
        successCallback(this.response);
      }
      else {
        failureCallback(this.response);
      }
    };

    xhr.send();
  }

  function postAjaxRequest(url, successCallback, failureCallback, data) {
    var xhr = _prepareXHR('POST', url, failureCallback);

    xhr.onload = function(e) {
      if (200 == this.status || this.status == 201) {
        successCallback(this.response);
      }
      else {
        failureCallback(this.response);
      }
    };

    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(data));
  }

  function patchAjaxRequest(url, successCallback, failureCallback, data) {
    var xhr = _prepareXHR('PATCH', url, failureCallback);

    xhr.onload = function(e) {
      if ((201 == this.status) || (204 == this.status)) {
        successCallback(this.response);
      }
      else {
        failureCallback(this.response);
      }
    };

    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(data));
  }

  return {
    get: getAjaxRequest,
    post: postAjaxRequest,
    del: deleteAjaxRequest,
    patch: patchAjaxRequest
  };

})();

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AJAXRequest;
  }
}
