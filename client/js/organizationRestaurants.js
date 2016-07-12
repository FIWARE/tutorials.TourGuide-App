'use strict';
/*
 * organizationRestaurants.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors:
 *   Jaisiel Santana <jaisiel@gmail.com>
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

*/
var map;
var utils;
var clientLogic;
// initialization
var initIndex = function() {
  map = L.map('map').setView([42.90816007196054, -2.52960205078125], 8);

  clientLogic.setUpDrawModule();

  // get franchise from sessionStorage
  var franchise = utils.getCurrentOrganization();
  if (franchise) {
    clientLogic.showOrganizationRestaurants(franchise);
  }

  // set tile layer
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution:
    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
};

utils.addLoadEvent(initIndex);
