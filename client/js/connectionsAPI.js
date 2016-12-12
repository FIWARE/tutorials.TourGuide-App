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
  var role = {
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
    logoutLink.href = '/logout';
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

    // view organizations restaurants
    if (hasRole(userInfo, role.restaurantViewer) ||
        hasRole(userInfo, role.globalManager) || true) {//hacked

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

        organizations.forEach(function(organization) {
          if (! (is_organization_manager(organization) ||
            hasRole(userInfo, role.globalManager))) {
            return;
          }
          var organizationLi = document.createElement('LI');
          organizationLi.className = 'dropdown-submenu';

          var organizationA = document.createElement('A');
          organizationA.tabIndex = -1;

          organizationA.href = '#';
          organizationA.textContent = organization.name;

          organizationLi.appendChild(organizationA);

          // submenu
          var organizationSubMenu = document.createElement('UL');
          organizationSubMenu.className = 'dropdown-menu';

          var restaurantLi = createSubMenu('Restaurants', '#',
            utils.targetOrganizationAndRedirect(organization.name,
              'organizationRestaurants.html'));
          organizationSubMenu.appendChild(restaurantLi);

          var reviewLi = createSubMenu('Reviews', '#',
            utils.targetOrganizationAndRedirect(organization.name,
              'organizationReviews.html'));
          organizationSubMenu.appendChild(reviewLi);

          var reservationsLi = createSubMenu('Reservations', '#',
            utils.targetOrganizationAndRedirect(organization.name,
              'organizationReservations.html'));
          organizationSubMenu.appendChild(reservationsLi);

          organizationLi.appendChild(organizationSubMenu);
          organizationsMenu.appendChild(organizationLi);
        });

        myOrganizationsLi.appendChild(organizationsMenu);

        loggedMenu.appendChild(myOrganizationsLi);
      }
    }

    if (hasRole(userInfo, role.endUser)) {
      var myReservations = document.createElement('LI');
      myReservations.className = 'menuElement';

      var myReservationsA = document.createElement('A');
      myReservationsA.href = 'myReservations.html';
      myReservationsA.textContent = 'My reservations';

      myReservations.appendChild(myReservationsA);
      loggedMenu.appendChild(myReservations);
    }

    if (hasRole(userInfo, role.endUser)) {
      var myReviews = document.createElement('LI');
      myReviews.className = 'menuElement';

      var myReviewsA = document.createElement('A');
      myReviewsA.href = 'myReviews.html';
      myReviewsA.textContent = 'My reviews';

      myReviews.appendChild(myReviewsA);
      loggedMenu.appendChild(myReviews);
    }

    // insert menu inside logged_div
    document.getElementById('loggedDiv').innerHTML += '';
    document.getElementById('loggedDiv').appendChild(loggedMenu);
  }

  function createSubMenu(text, href, onClickEvent) {
    var elementLi = document.createElement('LI');
    var elementA = document.createElement('A');
    elementA.tabIndex = -1;
    elementA.href = href;
    elementA.textContent = text;
    elementA.onclick = onClickEvent;
    elementLi.appendChild(elementA);
    return elementLi;
  }

  function hasRole(userInfo, roleName) {
    if (userInfo) {
      return userInfo.roles.filter(function(role) {
        return roleName == role.name;
      }).length > 0;
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
    logInA.href = '/auth';
    logInA.textContent = 'Log in';

    logInLi.appendChild(logInA);
    logInMenu.appendChild(logInLi);

    document.getElementById('loggedDiv').innerHTML = '';
    document.getElementById('loggedDiv').appendChild(logInMenu);
    return;
  }

  function loginNeeded(action) {
    if (getUser() != null) {
      action();
      return;
    }

    setTimeout(function() {
      if (getUser() != null) {
        action();
        return;
      }
      else {
        utils.showMessage('Login required', 'alert-warning');
      }
    }, loginTimeout);
  }

  // should be called once logged
  function getUser() {
    return JSON.parse(localStorage.getItem('userInfo'));
  }

  function is_organization_manager(organization) {
    if (organization.roles) {
      var managerRoles = [role.globalManager, role.franchiseManager];
      return organization.roles.filter(function(role) {
        return managerRoles.indexOf(role.name) > -1;
      }).length > 0;
    }
    return false;
  }

  return {
    loginNeeded: loginNeeded,
    loggedIn: loggedIn,
    notLoggedIn: notLoggedIn,
    hasRole: hasRole,
    role: role,
    getUser: getUser
  };
})();

var initConnections = function() {
  // check if user is logged in
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
