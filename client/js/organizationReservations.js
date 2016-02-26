/*
 * organizationReservarions.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors: 
 *   Jaisiel Santana <jaisiel@gmail.com>,
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

*/
//initialization
init_organization_reservations = function(){

$("#pop_window").modal()


//only show if the user is logged
login_needed(function(){
	userInfo= JSON.parse(localStorage.getItem("userInfo"));
	var organization = window.location.search.replace("?","");//get organization from url
	var prefix = "organization=";
	if (organization.slice(0, prefix.length) == prefix)
	{
		get_organization_reservation(organization.slice(prefix.length));
	}

});



// else bad url
//todo translate to common js
$("tbody").height($(window).height()- $("thead th").height()- $("#logged_div").height()-50);

}

addLoadEvent(init_organization_reservations);