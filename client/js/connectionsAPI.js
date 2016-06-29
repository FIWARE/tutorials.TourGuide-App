'use strict';
/*
 * connectionsAPI.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors:
 *   Jaisiel Santana <jaisiel@gmail.com>
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

  Module that contains funcionalities related to user and log in.

*/

/*exported connectionsAPI */

var AJAXRequest;
var utils;

var connectionsAPI = (function() {

  var rol = {
    endUser: 'End user',
    restaurantViewer: 'Restaurant viewer',
    globalManager: 'Global manager',
    franchiseManager: 'Franchise manager'
  };

  var loginTimeout = 500;

  function loggedIn(userInfo) {
    localStorage.setItem('userInfo', userInfo);

    userInfo = JSON.parse(userInfo);

    var logOutMenu = document.createElement('UL');
    logOutMenu.classList.add('nav', 'navbar-nav', 'pull-right');
    logOutMenu.id = 'logOutMenu';

    var hiUserLi = document.createElement('LI');
    hiUserLi.id = 'hiUser';
    hiUserLi.className = 'menuElement';

    var hiUserText = document.createElement('P');
    hiUserText.textContent = 'Hi ' + userInfo.displayName + '!';

    hiUserLi.appendChild(hiUserText);
    logOutMenu.appendChild(hiUserLi);

    var logOutLi = document.createElement('LI');
    logOutLi.id = 'logOut';
    logOutLi.className = 'menuElement';

    var logoutLink = document.createElement('A');
    logoutLink.id = 'logOutLink';
    logoutLink.href = 'http://tourguide/logout';
    logoutLink.textContent = 'Log out';

    logoutLink.onclick = function() {
      localStorage.removeItem('userInfo');
    };

    logOutLi.appendChild(logoutLink);
    logOutMenu.appendChild(logOutLi);

    document.getElementById('loggedDiv').innerHTML = '';

    document.getElementById('loggedDiv').appendChild(logOutMenu);

    createAndShowMenu(userInfo);

    return;
  }

  function createAndShowMenu(userInfo) {

    var loggedMenu = document.createElement('UL');
    loggedMenu.id = 'loggedMenu';
    loggedMenu.classList.add('nav', 'navbar-nav', 'pull-left');

    var home = document.createElement('LI');
    home.className = 'menuElement';

    var homeLink = document.createElement('A');
    homeLink.href = 'index.html';
    homeLink.textContent = 'Home';

    home.appendChild(homeLink);
    loggedMenu.appendChild(home);

    //view organizations restaurants
    if (hasRole(userInfo, rol.restaurantViewer) ||
        hasRole(userInfo, rol.globalManager) || true) {//hacked

      var organizations = userInfo.organizations;
      if (organizations.length > 0) {
        var myOrganizationsLi = document.createElement('LI');
        myOrganizationsLi.className = 'dropdown';

        var myOrganizationsA = document.createElement('A');
        myOrganizationsA.id = 'myOrganizationsButtonLink';
        myOrganizationsA.className = 'dropdown-toggle';
        myOrganizationsA.setAttribute('data-toggle', 'dropdown');
        myOrganizationsA.setAttribute('role', 'button');
        myOrganizationsA.href = '#';
        myOrganizationsA.textContent = 'My organizations';

        var caret = document.createElement('B');
        caret.className = 'caret';

        myOrganizationsA.appendChild(caret);
        myOrganizationsLi.appendChild(myOrganizationsA);

        var organizationsMenu = document.createElement('UL');
        organizationsMenu.className = 'dropdown-menu multi-level';
        organizationsMenu.setAttribute('aria-labelledby',
                                      'myOrganizationsButtonLink');
        organizationsMenu.setAttribute('role', 'menu');

        for (var index = 0; index < organizations.length; index++) {
          if (! (is_organization_manager(organizations[index]) ||
            hasRole(userInfo, rol.globalManager))) {
            continue;
          }
          var organizationLi = document.createElement('LI');
          organizationLi.className = 'dropdown-submenu';

          var organizationA = document.createElement('A');
          organizationA.tabIndex = -1;

            organizationA.href = '#';
          organizationA.textContent = userInfo.organizations[index].name;

          organizationLi.appendChild(organizationA);

          //submenu
          var organizationSubMenu = document.createElement('UL');
          organizationSubMenu.className = 'dropdown-menu';

          //restaurants submenu
          var restaurantLi = document.createElement('LI');
          var restaurantA = document.createElement('A');
          restaurantA.tabIndex = -1;
          restaurantA.href =
            'organizationRestaurants.html?organization=' +
            userInfo.organizations[index].name;
          restaurantA.textContent = 'Restaurants';

          restaurantLi.appendChild(restaurantA);
          organizationSubMenu.appendChild(restaurantLi);

          //reviews submenu
          var reviewLi = document.createElement('LI');
          var reviewA = document.createElement('A');
          reviewA.tabIndex = -1;
          reviewA.href =
            'organizationReviews.html?organization=' +
            userInfo.organizations[index].name;
          reviewA.textContent = 'Reviews';

          reviewLi.appendChild(reviewA);
          organizationSubMenu.appendChild(reviewLi);

          //reservations submenu
          var reservationsLi = document.createElement('LI');
          var reservationsA = document.createElement('A');
          reservationsA.tabIndex = -1;
          reservationsA.href =
            'organizationReservations.html?organization=' +
            userInfo.organizations[index].name;
          reservationsA.textContent = 'Reservations';

          reservationsLi.appendChild(reservationsA);
          organizationSubMenu.appendChild(reservationsLi);

          organizationLi.appendChild(organizationSubMenu);
          organizationsMenu.appendChild(organizationLi);
        }

        myOrganizationsLi.appendChild(organizationsMenu);

        loggedMenu.appendChild(myOrganizationsLi);
      }

    }

    if (hasRole(userInfo, rol.endUser)) {
      var myReservations = document.createElement('LI');
      myReservations.className = 'menuElement';

      var myReservationsA = document.createElement('A');
      myReservationsA.href = 'myReservations.html';
      myReservationsA.textContent = 'My reservations';

      myReservations.appendChild(myReservationsA);
      loggedMenu.appendChild(myReservations);
    }

    if (hasRole(userInfo, rol.endUser)) {
      var myReviews = document.createElement('LI');
      myReviews.className = 'menuElement';

      var myReviewsA = document.createElement('A');
      myReviewsA.href = 'myReviews.html';
      myReviewsA.textContent = 'My reviews';

      myReviews.appendChild(myReviewsA);
      loggedMenu.appendChild(myReviews);
    }

    //insert menu inside logged_div
    document.getElementById('loggedDiv').innerHTML += '';
    document.getElementById('loggedDiv').appendChild(loggedMenu);
  }

  function hasRole(userInfo, role) {
    if (userInfo) {
      for (var index = 0, len = userInfo.roles.length; index < len; ++index) {
        if (role == userInfo.roles[index].name) {
          return true;
        }
      }
    }
    return false;
  }

  function notLoggedIn() {
    localStorage.removeItem('userInfo');

    var logInMenu = document.createElement('UL');
    logInMenu.classList.add('nav', 'navbar-nav', 'pull-right');
    logInMenu.id = 'logIn';

    var logInLi = document.createElement('LI');
    logInLi.className = 'menuElement';

    var logInA = document.createElement('A');
    logInA.href = 'http://tourguide/auth';
    logInA.textContent = 'Log in';

    logInLi.appendChild(logInA);
    logInMenu.appendChild(logInLi);

    document.getElementById('loggedDiv').innerHTML = '';
    document.getElementById('loggedDiv').appendChild(logInMenu);
    return;
  }


  function loginNeeded(action) {
    if (null != getUser()) {
      action();
      return;
    }

    setTimeout(function() {
      if (null != getUser()) {
          action();
          return;
      }
      else {
        utils.showMessage('Login required', 'alert-warning');
      }
    }, loginTimeout);
  }

  //should be called once logged
  function getUser() {
    return JSON.parse(localStorage.getItem('userInfo'));
  }

  function is_organization_manager(organization) {
    if (organization.roles) {
      for (var i = organization.roles.length - 1; i >= 0; i--) {
       if (rol.franchiseManager == organization.roles[i].name ||
        rol.globalManager == organization.roles[i].name) {

          return true;
       }
      }
    }
    return false;
  }

  return {
    loginNeeded: loginNeeded,
    loggedIn: loggedIn,
    notLoggedIn: notLoggedIn,
    hasRole: hasRole,
    rol: rol,
    getUser: getUser
  };
})();


var initConnections = function() {
  //check if user is logged in
  AJAXRequest.get('/client/user',
    connectionsAPI.loggedIn,
    connectionsAPI.notLoggedIn);
};


if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = connectionsAPI;
    utils = require('./utils.js');
  }
}


utils.addLoadEvent(initConnections);


