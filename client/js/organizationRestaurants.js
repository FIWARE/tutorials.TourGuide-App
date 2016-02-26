/*
 * organizationRestaurants.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors: 
 *   Jaisiel Santana <jaisiel@gmail.com>,
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

*/
//initialization
init_index = function(){
map = L.map('map').setView([42.90816007196054, -2.52960205078125], 8);


login_needed(function(){
	userInfo= JSON.parse(localStorage.getItem("userInfo"));
	organization = window.location.search.replace("?","");//get organization from url
	prefix = "organization=";
	if (organization.slice(0, prefix.length) == prefix)
	{
		get_organization_restaurants(organization.slice(prefix.length));
	}

});

//set tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


d = new Date();
d.yyyymmdd();


$('#reservation_date').datepicker({
    dateFormat: "yy-mm-dd",
    minDate: "-0d",//only allow future reservations
    maxDate: "+90d", // 3 month max
    firstDay: 0,
    beforeShowDay: calcCurrentReservations
});

}

addLoadEvent(init_index);