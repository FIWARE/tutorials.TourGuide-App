'use strict';
/*
 * utils.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors:
 *   Jaisiel Santana <jaisiel@gmail.com>
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

  This module contains a set of utils to be used from another modules.

*/
/*exported utils*/
var utils = (function() {

  /* alerType could be alert-warning(default) or alert-danger*/
  function showMessage(message, alertType) {
    alertType = typeof alertType !== 'undefined' ? alertType : 'alert-warning';

    var alert = document.createElement('DIV');
    alert.classList.add('alert', 'fade', 'in', alertType);
    alert.textContent = message;

    var closeButton = document.createElement('BUTTON');
    closeButton.className = 'close';
    closeButton.setAttribute('data-dismiss', 'alert');
    closeButton.textContent = 'X';
    alert.appendChild(closeButton);

    var navBar = document.getElementById('topMenu');

    var mainContainer = document.getElementsByClassName('container-fluid')[0];

    mainContainer.insertBefore(alert, navBar.nextSibling);
  }

  function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
      window.onload = func;
    }
    else {
      window.onload = function() {
        if (oldonload) {
          oldonload();
        }
        func();
      };
    }
  }

  /* aux function, it changes the date format to print reservations */
  function fixBookingTime(bookingTime) {
    var d = new Date(bookingTime);
    return '' + d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  }

  function getCurrentOrganization() {
    return sessionStorage.getItem('targetOrganization');
  }

  function targetOrganizationAndRedirect(organization, url) {
    return function() {
      sessionStorage.setItem('targetOrganization', organization);
      window.location = url;
    };
  }

  return {
    addLoadEvent: addLoadEvent,
    showMessage: showMessage,
    fixBookingTime: fixBookingTime,
    getCurrentOrganization: getCurrentOrganization,
    targetOrganizationAndRedirect: targetOrganizationAndRedirect
  };
})();

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
    global.sessionStorage = require('sessionstorage');
    global.window = {};
  }
}
