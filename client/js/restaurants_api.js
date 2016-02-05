/*
 * restaurants_api.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors: 
 *   Jaisiel Santana <jaisiel@gmail.com>,
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

*/

//global vars
var map; //map instance
//a proxy should be used if the API is not in the same location as the web app.
proxyurl='';



/* get all restaurants and show it */
function get_all_restaurants()
{
	get_ajax_petition("http://compose_tourguide_1/api/orion/restaurants/", showRestaurants, function(){alert('Could not retrive restaurants');});
}

function get_organization_restaurants(organization){
	url = "http://compose_tourguide_1/api/orion/restaurants/organization/"+organization
	get_ajax_petition(url, 
		showRestaurants, function(){alert('Could not retrive restaurants');}
		);
}

/*show restaurants from the API response*/
function showRestaurants(restaurants)
{
	
	restaurants= JSON.parse(restaurants);
	//loop over all restaurants
	restaurant_marks=new Array();
	errors = 0;
	for(i=0, len= restaurants.length; i< len; i++)
	{	
		
		restaurant=restaurants[i];
		mark={'name': restaurant['name']};

		//get desired attributes
		try
		{
			mark['address'] = restaurant["address"]['streetAddress'];
			
		}
		catch(err)
		{
			console.log("Cannot get street address for "+ restaurant["name"]);
		}

		try
		{
			mark['locality'] = restaurant["address"]['addressLocality'];	
		}
		catch(err)
		{
			console.log("Cannot get locality address for "+ restaurant["name"]);
		}

		try
		{
			mark['region'] = restaurant["address"]['addressRegion'];	
		}
		catch(err)
		{
			console.log("Cannot get region address for "+ restaurant["name"]);
		}

		try
		{
			mark['telephone'] = restaurant['telephone'];	
		}
		catch(err)
		{
			console.log("Cannot get telephone for "+ restaurant["name"]);
		}

		try
		{
			mark['description'] = restaurant['description'];	
		}
		catch(err)
		{
			console.log("Cannot get description for "+ restaurant["name"]);
		}

		try
		{
			mark['ratingValue'] = restaurant["aggregateRating"]['ratingValue'];	
		}
		catch(err)
		{
			console.log("Cannot get ratingValue for "+ restaurant["name"]);
		}

		try
		{
			mark['reviewCount'] = restaurant["aggregateRating"]['reviewCount'];	
		}
		catch(err)
		{
			console.log("Cannot get reviewCount for "+ restaurant["name"]);
		}

		mark['coords'] = [] ;

		try
		{
			mark['coords'].push(parseFloat(restaurant["geo"]['latitude']));	
			if (isNaN(mark['coords'][0]) )
			{
				console.log("invalid latitude "+ restaurant["geo"]['latitude'] + " for restaurant " +restaurant["name"] );
				errors = errors + 1;
				continue;
			}
		}
		catch(err)
		{
			console.log("Cannot get latitude for "+ restaurant["name"]);
			console.log(err);
			errors = errors + 1;
			continue;
		}
	
		try
		{
			mark['coords'].push(parseFloat(restaurant["geo"]['longitude']));
			if (isNaN(mark['coords'][1]) )
			{
				console.log("invalid longitude "+ restaurant["geo"]['longitude'] + " for restaurant " +restaurant["name"] );
				errors = errors + 1;
				continue;
			}	
		}
		catch(err)
		{
			console.log("Cannot get longitude for "+ restaurant["name"]);
			console.log(err);
			errors = errors + 1;
			continue;
		}

		
		restaurant_marks.push(mark);
	}
	//console.log("Errors: "+ errors);

    /* clustering approach */
    var markerClusters = L.markerClusterGroup({showCoverageOnHover: true});
    markers= new Array();
	for(var i=0, len= restaurant_marks.length; i< len; i++)
	{
		
		//add mark to map
		restaurant_marks[i]['mark']= L.marker(restaurant_marks[i]['coords'])
		popHtml="<div class='markPopUp'><b>"+restaurant_marks[i]['name']+"</b><br>Address: "+restaurant_marks[i]['address']+"<br>Phone: "+
		restaurant_marks[i]['telephone']+
		'<br><a onclick="getAndShowRestaurantReviews(\''+ restaurant_marks[i]['name'] + '\')">Show reviews </a>'+
		'<br><a onclick="getAndShowRestaurantReservations(\''+ restaurant_marks[i]['name'] + '\')">Show reservations </a>'+
		'<br>'+add_create_review_link(restaurant_marks[i]['name'])+
		'<br>'+add_create_reservation_link(restaurant_marks[i]['name'])+
		'</div>';
		restaurant_marks[i]['mark'].bindPopup(popHtml);
	
			
		//reference all mark info for use from leaflet
		restaurant_marks[i]['mark']['extraInfo']= restaurant_marks[i];
		
		markerClusters.addLayer( restaurant_marks[i]['mark'] )
		
		//group for make a bbox that contains all markers. Skipped Pascual Berganzo because it is in Colombia 
		if (restaurant_marks[i]['name']!= 'Pascual Berganzo')
			markers.push(restaurant_marks[i]['mark']);

	}
	 

	 
	group = new L.featureGroup(markers);

	//set the view
 	//map.fitBounds(group.getBounds().pad(0.5));
	map.addLayer( markerClusters );
}


function add_create_review_link(restaurant_name)
{
	userInfo= JSON.parse(localStorage.getItem("userInfo"));

	if (! has_role(userInfo, "End user" ))
		return "";

	return '<a onclick="editNewReview(\''+ restaurant_name + '\')"> Create review</a>';
}



function editNewReview(restaurant_name){

	userInfo= JSON.parse(localStorage.getItem("userInfo"));
	document.getElementById("pop_title").innerHTML =''+restaurant_name;
	reviewForm = '';
	reviewForm +='\n<form name="editReviewForm" class="editReviewForm">';
	reviewForm +='\nYour review:<br>';
	reviewForm +='\n<textarea name="reviewBody"></textarea><br>';
	reviewForm +='\nRating value:';
	reviewForm +='\n<select name="ratingValue">';
  	reviewForm +='\n<option value="0">0 Stars</option>';
  	reviewForm +='\n<option value="1">1 Star</option>';
  	reviewForm +='\n<option value="2">2 Stars</option>';
  	reviewForm +='\n<option value="3">3 Stars</option>';
  	reviewForm +='\n<option value="4">4 Stars</option>';
  	reviewForm +='\n<option value="5">5 Stars</option>';
	reviewForm +='\n</select>';
	reviewForm +='\n</form>';
	reviewForm +='\n<input type="submit" value="Create Review" onclick="createNewReview(\''+restaurant_name+'\')">';
	reviewForm +='\n</form>';


	document.getElementById("pop_content").innerHTML =reviewForm;

	openPopUpWindow();

}


function createNewReview(restaurant_name)
{
	var ratingValue = document.forms["editReviewForm"]["ratingValue"].value;
	var reviewBody = document.forms["editReviewForm"]["reviewBody"].value;


	data = {
		  "@type": "Review",
		  "itemReviewed": {
		    "@type": "Restaurant",
		    "name": ""+restaurant_name,
		  },
		  "name": "Rating description",
		  "reviewBody": ""+reviewBody,
		  "reviewRating": {
		    "@type": "Rating",
		    "ratingValue": ratingValue
		  }
		};



	post_ajax_petition('http://compose_tourguide_1/api/orion/review/',
		closePopUpWindow, 
		function(err){alert("Cannot add review"), console.log(err)}, data);

}



function add_create_reservation_link(restaurant_name)
{
	userInfo= JSON.parse(localStorage.getItem("userInfo"));

	if (! has_role(userInfo, "End user" ))
		return "";

	return '<a onclick="editNewReservation(\''+ restaurant_name + '\')"> Make a reservation</a>';
}



function editNewReservation(restaurant_name){

	userInfo= JSON.parse(localStorage.getItem("userInfo"));

	reservations_per_date = null;

	get_reservations_per_date(restaurant_name);
	document.getElementById("pop_title").innerHTML ='Reservation for '+restaurant_name;
	reservationForm = '';
	reservationForm +='\n<form name="editReservationForm">';
	reservationForm +='\nDate:<br>';
	reservationForm += '\n<input id = "reservation_date"> <br>';
	//reservationForm +='\n<input type="datetime-local" name="reservationDate"><br>';
	reservationForm +='\nTime:<br>';
	reservationForm += '\n<input id = "reservation_time"> <br>';
	reservationForm +='\nNumber of commensals:';
	reservationForm +='\n<select name="partySize">';
  	//reservationForm +='\n<option value="0">0</option>';
  	reservationForm +='\n<option value="1">1</option>';
  	reservationForm +='\n<option value="2">2</option>';
  	reservationForm +='\n<option value="3">3</option>';
  	reservationForm +='\n<option value="4">4</option>';
  	reservationForm +='\n<option value="5">5</option>';
	reservationForm +='\n</select>';
	//reservationForm +='\n<input type="number" name="partySize" min="1" max="20">';
	reservationForm +='\n</form>';
	reservationForm +='\n<input type="submit" value="Create reservation" onclick="createNewReservation(\''+restaurant_name+'\')">';
	reservationForm +='\n</form>';


	document.getElementById("pop_content").innerHTML =reservationForm;

	$('#reservation_date').datepicker({
	    dateFormat: "yy-mm-dd",
	    minDate: "-0d",//only allow future reservations
	    maxDate: "+90d", // 3 month max
	    firstDay: 0,
	    beforeShowDay: function(date){
	    	return calcCurrentReservations(date, restaurant_name);
	    }
	});

	$('#reservation_time').timepicker({
		'timeFormat': 'H:i:s',
		'minTime': '12:30pm',
    	'maxTime': '10:30pm',
	    'disableTimeRanges': [
	        ['4pm', '8:01pm']
	    ]
	});


	openPopUpWindow();

}


function createNewReservation(restaurant_name)
{
	var partySize = document.forms["editReservationForm"]["partySize"].value;
	//var reservationDate = document.forms["editReservationForm"]["reservationDate"].value;
	var reservationDate = document.forms["editReservationForm"]["reservation_date"].value;

	console.log("reservation info:");
	
	console.log(document.forms["editReservationForm"]["reservation_date"].value);
	
	console.log(document.forms["editReservationForm"]["reservation_time"].value);

	reservation_datetime = document.forms["editReservationForm"]["reservation_date"].value+"T"+document.forms["editReservationForm"]["reservation_time"].value;

	

	data = {
			  "@type": "FoodEstablishmentReservation",
			  "partySize": partySize,
			  "reservationFor": {
			    "@type": "FoodEstablishment",
			    "name": ""+restaurant_name
			  },
			  "startTime": reservation_datetime
			}



	
	post_ajax_petition('http://compose_tourguide_1/api/orion/reservation/',
		closePopUpWindow, 
		function(err){alert("Cannot add reservation"), console.log(err)}, data);

}




/*get reviews from a restaurant an show it */
function getAndShowRestaurantReviews(id)
{
	url="http://compose_tourguide_1/api/orion/reviews/restaurant/"+id;
	document.getElementById("pop_title").innerHTML =id;
	get_ajax_petition(url,
			showRestaurantReviews,
			 function(){
			 	document.getElementById("pop_content").innerHTML ="<h2>Cannot get reviews.</h2>";
             	openPopUpWindow();
			 });
}



/*show restaurant reviews from a API response */
/* At this moment, show all reviews without pagination */
function showRestaurantReviews(reviewsResponse)
{
	reviewsResponse= JSON.parse(reviewsResponse);

	console.log(reviewsResponse);

	//remove previous content
	var myNode = document.getElementById("pop_content");
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.lastChild);
	}

	if (reviewsResponse.length < 1)
	{
		document.getElementById("pop_content").innerHTML ="<h2>No reviews are available.</h2>";
		openPopUpWindow();
	    return;

	}

	/*
	reviewsHtml='<div class="reviewList">\n';
	for (j=0, lim=reviewsResponse.length; j < lim; j++)
	{
		reviewBody = reviewsResponse[j]["reviewBody"]

		reviewsHtml= reviewsHtml+ '<div class="reviewElement">'+
		'\n<p>\n<span class="rating_label">Rating: </span> <span class="rating_value">' +
			reviewsResponse[j]["reviewRating"]["ratingValue"]+
			'</span>\n</p>\n<p>\n<span class="review_label">Review text</spam>\n</p>\n<p class="review">'+
			reviewsResponse[j]["reviewBody"]+'</p>\n</div>';
	}
	reviewsHtml= reviewsHtml+'\n</div>';

	*/
	var reviewList = document.createElement("DIV");
	reviewList.setAttribute("class", "reviewList");
	
	for (var j=0, lim = reviewsResponse.length; j<lim; j++)
	{
		var reviewElement = document.createElement("DIV");
		reviewElement.setAttribute("class", "reviewElement");

		//top container
		var top = document.createElement("DIV");
		top.setAttribute("class", "review-top");

		//rating
		var rating = document.createElement("DIV");
		rating.setAttribute("class", "rating-div");
		rating.innerHTML = '<span class="rating_label">Rating: </span> <span class="rating_value">' +
			reviewsResponse[j]["reviewRating"]["ratingValue"]+
			'</span>';
		top.appendChild(rating);

		//author
		var author = document.createElement("DIV");
		author.setAttribute("class", "author-div");
		author.innerHTML = '<span class="author_label">Author: </span> <span class="author_value">' +
			reviewsResponse[j]["author"]["name"]+
			'</span>';
		top.appendChild(author);


		reviewElement.appendChild(top);

		//date 
		/*var review_date = document.createElement("DIV");
		review_date.setAttribute("class", "review_date-div");
		review_date.innerHTML = '<span class="review_date_label">Date: </span> <span class="review_date_value">' +
			reviewsResponse[j][""][""]+
			'</span>';
		reviewElemnt.appendChild(review_date);*/
		
		var hr = document.createElement("HR");
		reviewElement.appendChild(hr);
		//body
		var body = document.createElement("DIV");
		body.setAttribute("class", "review_body-div");
		body.innerHTML = '<span class="body_label"></span> <span class="body_value">' +
			reviewsResponse[j]["reviewBody"]+
			'</span>';
		reviewElement.appendChild(body);

		reviewList.appendChild(reviewElement);
	}

	//render the reviews
	//document.getElementById("pop_content").innerHTML =reviewsHtml;
	myNode.appendChild(reviewList);
	
	openPopUpWindow();

}


/*get reservations from a restaurant an show it */
function getAndShowRestaurantReservations(id)
{
	url = "http://compose_tourguide_1/api/orion/reservations/restaurant/"+id;
	document.getElementById("pop_title").innerHTML =id;
	get_ajax_petition(url,
		showRestaurantReservations, 
		function(){
			document.getElementById("pop_content").innerHTML ="<h2>Cannot get reservations.</h2>";
             openPopUpWindow();
	} );
}



/*show restaurant reservations from a API response */
/* At this moment, only show the reservations without pagination */
function showRestaurantReservations(reservationsResponse)
{


	//remove previous content
	var myNode = document.getElementById("pop_content");
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.lastChild);
	}


	reservationsResponse= JSON.parse(reservationsResponse);

	if (reservationsResponse.length < 1)
	{
		document.getElementById("pop_content").innerHTML ="<h2>No reservations are available.</h2>";
		openPopUpWindow();
	    return;

	}

	/*
	reservationsHtml='<div class="reservationList">\n';
	for (j=0, lim=reservationsResponse.length; j < lim; j++)
	{
	
		reservationsHtml= reservationsHtml+ '<div class="reservationElement">\n<p>\n<span class="reservation_time_label">Time: </span> <span class="time_value">' +
			fixBookingTime(reservationsResponse[j]["startTime"])+
			'</span>\n</p>\n<p>\n<span class="under_name_reservation_label">Reserved by</spam>\n</p>\n<p class="under_name_reservation">'+reservationsResponse[j]["underName"]["name"]+'</p>'+
			'\n<span class="commensals_number_label">Commensals</spam>\n</p>\n<p class="commensals">'+reservationsResponse[j]["partySize"]+'</p>\n</div>';
	reservationsHtml= reservationsHtml+'\n</div>';
	}
	
	//render the reservations
	document.getElementById("pop_content").innerHTML =reservationsHtml;
	*/


	var reservationsTable = document.createElement("DIV");
	reservationsTable.setAttribute("class", "table table-fixed table-hover");

	var tableHead= document.createElement("THEAD");
	
	var row = document.createElement("TR");
	row.setAttribute("class","row");

	var underNameHead = document.createElement("TH");
	underNameHead.setAttribute("class","col-xs-6");
	underNameHead.innerHTML = "Reserved by: ";
	row.appendChild(underNameHead);

	var timeHead = document.createElement("TH");
	timeHead.setAttribute("class","col-xs-4");
	timeHead.innerHTML = "Resrvation time: ";
	row.appendChild(timeHead);

	var commensalsHead = document.createElement("TH");
	commensalsHead.setAttribute("class","col-xs-2");
	commensalsHead.innerHTML = "Commensals: ";
	row.appendChild(commensalsHead);

	tableHead.appendChild(row);
	reservationsTable.appendChild(tableHead);



	var tableBody = document.createElement("TBODY");
	
	for (var j=0, lim=reservationsResponse.length; j < lim; j++)
	{
		var row = document.createElement("TR");
		//row.setAttribute("class","row");
		/*
		var name = document.createElement("TD");
		name.setAttribute("class", "col-xs-4");
		name.innerHTML = reservationsResponse[j]["reservationFor"]["name"];
		row.appendChild(name);
		*/



		var underName = document.createElement("TD");
		underName.setAttribute("class", "col-xs-6");
		underName.innerHTML = reservationsResponse[j]["underName"]["name"];
		row.appendChild(underName);

		var time = document.createElement("TD");
		time.setAttribute("class", "col-xs-4");
		time.innerHTML =  fixBookingTime(reservationsResponse[j]["startTime"])
		row.appendChild(time);

		var commensals = document.createElement("TD");
		commensals.setAttribute("class", "col-xs-2");
		commensals.innerHTML = reservationsResponse[j]["partySize"];
		row.appendChild(commensals);




		tableBody.appendChild(row);
	}

	reservationsTable.appendChild(tableBody);
	document.getElementById("pop_content").appendChild(reservationsTable);
	openPopUpWindow();
}


function get_user_reservation(username){
	url = "http://compose_tourguide_1/api/orion/reservations/user/"+username;
	get_ajax_petition(url,
		//create_reservations_list,
		create_reservations_table,
		function(){alert("cannot get your reservations");});
}

function create_reservations_list(reservationsResponse)
{
	reservationsResponse= JSON.parse(reservationsResponse);

	if (reservationsResponse.length < 1)
	{
		document.getElementById("reservations_list_div").innerHTML = "<h2>No reservations are available.</h2>" + document.getElementById("reservations_list_div").innerHTML;
	    return;

	}

	
	document.getElementById("reservation_list").innerHTML = "";
	cancel_reservation_url_base = "";
	for (j=0, lim=reservationsResponse.length; j < lim; j++)
	{
		reservationHTML = "<li>" +
			'<span class="restaurant_reservation_label">Restaurant: </span> <span class="restaurant_reservation_">' +
				reservationsResponse[j]["reservationFor"]["name"] +
			'</span>\n'	+
			'<span class="reservation_time_label">Time: </span> <span class="time_value">' +
				 fixBookingTime(reservationsResponse[j]["startTime"])+
			'</span>\n'+
			'<span class="commensals_number_label">Commensals</span>\n<span class="commensals">'+
			reservationsResponse[j]["partySize"]+
			'</span>\n'+
			'<span class="cancel_reservation"><a href="javascript:cancel_reservation('+
			'\''+reservationsResponse[j]["reservationId"]+'\''	 + ')"> cancel reservation </a>'+
			'</span>\n'+
			'</li>';

		//reservationHTML = reservationHTML.replace("__reservation_id__",reservationsResponse[j]["reservationId"]);
		//console.log(typeof reservationsResponse[j]["reservationId"]);

		document.getElementById("reservation_list").innerHTML += reservationHTML;
	}
	
}



function create_reservations_table(reservationsResponse)
{
	reservationsResponse= JSON.parse(reservationsResponse);

	if (reservationsResponse.length < 1)
	{
		document.getElementById("reservations_list_div").innerHTML = "<h2>No reservations are available.</h2>" + document.getElementById("reservations_list_div").innerHTML;
	    return;

	}

	//clean previous table content
	var myNode = document.getElementById("reservations_table_body");
		while (myNode.firstChild) {
		    myNode.removeChild(myNode.lastChild);
		}
	cancel_reservation_url_base = "";
	for (var j=0, lim=reservationsResponse.length; j < lim; j++)
	{
		var row = document.createElement("TR");

		var name = document.createElement("TD");
		name.innerHTML = reservationsResponse[j]["reservationFor"]["name"];
		row.appendChild(name);

		var time = document.createElement("TD");
		time.innerHTML =  fixBookingTime(reservationsResponse[j]["startTime"])
		row.appendChild(time);

		var commensals = document.createElement("TD");
		commensals.innerHTML = reservationsResponse[j]["partySize"];
		row.appendChild(commensals);

		var cancel = document.createElement("TD");
		cancel.innerHTML = '<a href="javascript:cancel_reservation('+
			'\''+reservationsResponse[j]["reservationId"]+'\''	 + ')"> cancel reservation </a>';
		row.appendChild(cancel);


		document.getElementById("reservations_table_body").appendChild(row);
	}
	
}




function cancel_reservation(reservation_id)
{
	
	//alert("atemp to cancel "+ reservation_id);
	if( !(window.confirm("Delete reservation?") ))
		return;

	delete_ajax_petition('http://compose_tourguide_1/api/orion/reservation/'+reservation_id, 
			function(){location.reload();}, 
			function(err){alert("Could not delete the reservation."); console.log(err); /*location.reload();*/})

}



function get_user_reviews(username){
	url = "http://compose_tourguide_1/api/orion/reviews/user/"+username;
	get_ajax_petition(url,
		//create_reviews_list,
		create_reviews_table,
		function(){alert("cannot get your reviews");});
}


function create_reviews_list(reviewsResponse)
{
	reviewsResponse= JSON.parse(reviewsResponse);

	if (reviewsResponse.length < 1)
	{
		document.getElementById("reviews_list_div").innerHTML = "<h2>No reviews are available.</h2>" + document.getElementById("reviews_list_div").innerHTML;
	    return;

	}

	
	document.getElementById("review_list").innerHTML = "";
	cancel_reservation_url_base = "";
	for (j=0, lim=reviewsResponse.length; j < lim; j++)
	{
		reservationHTML = "<li>" +
			'<span class="restaurant_review_label">Restaurant: </span> <span class="restaurant_review_">' +
				reviewsResponse[j]["itemReviewed"]["name"] +
			'</span>\n'	+
			'<span class="review_rating_value">Rating: </span> <span class="rating_value">' +
				 reviewsResponse[j]["reviewRating"]["ratingValue"]+
			'</span>\n'+
			'<span class="view_review"><a href="javascript:view_review('+
			'\''+reviewsResponse[j]["reviewId"]+'\''	 + ')"> View review </a>'+
			'</span>\n'+
			'<span class="edit_review"><a href="javascript:edit_review('+
			'\''+reviewsResponse[j]["reviewId"]+'\''	 + ')"> Edit review </a>'+
			'</span>\n'+
			'<span class="delete_review"><a href="javascript:delete_review('+
			'\''+reviewsResponse[j]["reviewId"]+'\''	 + ')"> Delete review </a>'+
			'</span>\n'+
			'</li>';

		//reviewHTML = reviewHTML.replace("__review_id__",reviewsResponse[j]["reviewId"]);
		//console.log(typeof reviewsResponse[j]["reviewId"]);

		document.getElementById("review_list").innerHTML += reservationHTML;
	}
	
}


function create_reviews_table(reviewsResponse)
{
	reviewsResponse= JSON.parse(reviewsResponse);

	if (reviewsResponse.length < 1)
	{
		document.getElementById("reviews_list_div").innerHTML = "<h2>No reviews are available.</h2>" + document.getElementById("reviews_list_div").innerHTML;
	    return;

	}

	//clean previous table content
	var myNode = document.getElementById("reviews_table_body");
		while (myNode.firstChild) {
		    myNode.removeChild(myNode.lastChild);
		}
	cancel_reservation_url_base = "";
	for (var j=0, lim=reviewsResponse.length; j < lim; j++)
	{

		var row = document.createElement("TR");

		var name = document.createElement("TD");
		name.innerHTML = reviewsResponse[j]["itemReviewed"]["name"];
		name.setAttribute("class","col-xs-4");
		row.appendChild(name);

		var rating = document.createElement("TD");
		rating.innerHTML =  reviewsResponse[j]["reviewRating"]["ratingValue"];
		rating.setAttribute("class","col-xs-2");
		row.appendChild(rating);


		var view = document.createElement("TD");
		view.innerHTML = '<a href="javascript:view_review('+
			'\''+reviewsResponse[j]["reviewId"]+'\''	 + ')"> View review </a>';
		view.setAttribute("class","col-xs-2");
		row.appendChild(view);

		var edit = document.createElement("TD");
		edit.innerHTML = '<a href="javascript:edit_review('+
			'\''+reviewsResponse[j]["reviewId"]+'\''	 + ')"> Edit review </a>';
		edit.setAttribute("class","col-xs-2");
		row.appendChild(edit);

		var del = document.createElement("TD");
		del.innerHTML = '<a href="javascript:delete_review('+
			'\''+reviewsResponse[j]["reviewId"]+'\''	 + ')"> Delete review </a>';
		del.setAttribute("class","col-xs-2");
		row.appendChild(del);


		document.getElementById("reviews_table_body").appendChild(row);
	}
	
}



function delete_review(review_id)
{
	if( !(window.confirm("Delete review?") ))
		return;

	delete_ajax_petition('http://compose_tourguide_1/api/orion/review/'+review_id, 
			function(){location.reload();}, 
			function(err){alert("Could not delete the review."); console.log(err); /*location.reload();*/})

}


/* aux function that open the PopUp windows */
function openPopUpWindow(){
	/*
	document.getElementById("pop_window").className = document.getElementById("pop_window").className.replace('hidden', '');
	document.getElementById("pop_window").className = document.getElementById("pop_window").className.replace('  ', ' ');
	*/
	$("#pop_window").modal('show');
}

/*aux function that close the PopUp window */
function closePopUpWindow(){
	/*
	if (! (document.getElementById("pop_window").className.indexOf('hidden') > -1 ) )
		document.getElementById("pop_window").className = document.getElementById("pop_window").className + ' hidden';
	*/
	$("#pop_window").modal('hide');
}

/* axu function, it change the format date to print reservations */
function fixBookingTime(bookingTime){
	d= new Date(bookingTime);
	return ""+ d.toLocaleDateString()+" "+d.toLocaleTimeString();
}






var reservations_per_date = {
"2016-02-24": 2,
"2016-02-25": 10,
"2016-02-23": 7,
"2016-02-29": -1,
"2016-02-30": 9
};

Date.prototype.yyyymmdd = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return yyyy +"-"+ (mm.length===2?mm:"0"+mm[0]) +"-"+ (dd[1]?dd:"0"+dd[0]); // padding
  };




function calcCurrentReservations(date, restaurant_name){
  
 
  if (date < new Date())
    return [false, "past_date", ""];

  var string_date = date.toLocaleDateString()
  console.log(string_date);
  console.log(reservations_per_date)
  date = date.yyyymmdd();
  //console.log(date);
  
  if("undefined" === typeof(reservations_per_date[string_date]))
    return [true, "available_reservations", ""];
  
  if (0 > reservations_per_date[string_date])
    return [false, "not_allowed full_reservations", "No reservations allowed for this day"];
  
  if (5 > reservations_per_date[string_date])
    return [true, "available_reservations",reservations_per_date[date] ];
  
  if (10 > reservations_per_date[string_date])
    return [true, "last_reservations", reservations_per_date[date] ];  
    
 
 return [false, "full_reservations", "Full reservations" ]
       

}

function get_reservations_per_date(restaurant_name){
	url = url = "http://compose_tourguide_1/api/orion/reservations/restaurant/"+restaurant_name;
	get_ajax_petition(url,
			set_reservations_per_date_var,
			 function(){
			 	reservations_per_date = [];
			 });
}



function set_reservations_per_date_var(reservationsResponse)
{

	reservationsResponse= JSON.parse(reservationsResponse);
	reservations_per_date = [];
	if (reservationsResponse.length < 1)
	{
	    return;
	}

	var date_day;
	var j;
	var lim;
	for (j=0,  lim=reservationsResponse.length; j < lim; j++)
	{
	
		date_day = new Date(reservationsResponse[j]["startTime"]);
		date_day = "" + date_day.toLocaleDateString();
		
		if ("undefined" === typeof(reservations_per_date[date_day]))
			reservations_per_date[date_day]=1;
		else
			reservations_per_date[date_day] = reservations_per_date[date_day] +1;
	}
	
}