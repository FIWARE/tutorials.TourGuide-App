//global vars
var map; //map instance
//a proxy should be used if the API is not in the same location as the web app.
proxyurl='';

//initialization
window.onload = function(){
map = L.map('map').setView([42.90816007196054, -2.52960205078125], 8);


get_all_restaurants();

//set tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


}

/* get all restaurants and show it */
function get_all_restaurants()
{
    var xmlhttp;

    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
           if(xmlhttp.status == 200){
               showRestaurants( xmlhttp.responseText );
           }
           else if(xmlhttp.status == 400) {
              alert('Could not retrive restaurants')
           }
           else {
               alert('Could not retrieve restaurants')
           }
        }
    }
    url=proxyurl+"http://compose_devguide_1/api/orion/restaurants/";
    xmlhttp.open("GET", proxyurl+"http://compose_devguide_1/api/orion/restaurants/", true);
    xmlhttp.send();
}

/*show restaurants from the API response*/
function showRestaurants(restaurants)
{
	
	restaurants= JSON.parse(restaurants)['contextResponses'];
	//loop over all restaurants
	restaurant_marks=new Array();
	for(i=0, len= restaurants.length; i< len; i++)
	{	
		
		restaurant=restaurants[i]['contextElement'];
		attributes = restaurant['attributes'];
		mark={id: restaurant['id']};

		//get only desired attributes
		for(j=0, len= attributes.length; j< len; j++)
		{
			if ("address" == attributes[j]['name'])
			{
				mark['address']=attributes[j]['value'];
			}
			if ("email" == attributes[j]['name'])
			{
				mark['email']=attributes[j]['value'];
			}
			if ("location" == attributes[j]['name'])
			{
				mark['coords']=attributes[j]['value'].split(', ');
				mark['coords'][0]= parseFloat(mark['coords'][0]);
				mark['coords'][1]= parseFloat(mark['coords'][1]);
			}
			if ("phoneNumber" == attributes[j]['name'])
			{
				mark['tlf']=attributes[j]['value'];
			}
			if ("web" == attributes[j]['name'])
			{
				mark['web']=attributes[j]['value'];
			}
		}
		restaurant_marks.push(mark);
	}
	markers= new Array();
	for(i=0, len= restaurant_marks.length; i< len; i++)
	{
		
		//add mark to map
		restaurant_marks[i]['mark']= L.marker(restaurant_marks[i]['coords']).addTo(map);
		popHtml="<div class='markPopUp'><b>"+restaurant_marks[i]['id']+"</b><br>Address: "+restaurant_marks[i]['address']+"<br>Phone: "+
		restaurant_marks[i]['tlf']+"<br>email: "+restaurant_marks[i]['email']+"<br>web: "+restaurant_marks[i]['web']+
		'<br><a onclick="getAndShowReviews(\''+ restaurant_marks[i]['id'] + '\')">Show reviews </a>'+
		'<br><a onclick="getAndShowReservations(\''+ restaurant_marks[i]['id'] + '\')">Show reservations </a></div>';
		restaurant_marks[i]['mark'].bindPopup(popHtml);
	
			
		//reference all mark info for use from leaflet
		restaurant_marks[i]['mark']['extraInfo']= restaurant_marks[i];
		
		
		//group for make a bbox that contains all markers. Skipped Pascual Berganzo because it is in Colombia 
		if (restaurant_marks[i]['id']!= 'Pascual Berganzo')
			markers.push(restaurant_marks[i]['mark']);

	}
	 
	group = new L.featureGroup(markers);

	//set the view
 	map.fitBounds(group.getBounds().pad(0.5));
	
}

/*get reviews from a restaurant an show it */
function getAndShowReviews(id)
{
    var xmlhttp;

    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
           if(xmlhttp.status == 200){
           	   document.getElementById("pop_title").innerHTML =id;
               showReviews( xmlhttp.responseText );
           }
           else if(xmlhttp.status == 400) {
             document.getElementById("pop_content").innerHTML ="<h2>Cannot get reviews.</h2>";
             openPopUpWindow();
             return;
           }
           else {
             document.getElementById("pop_content").innerHTML ="<h2>Cannot get reviews.</h2>";
             openPopUpWindow();
             return;
           }
        }
    }

    xmlhttp.open("GET", proxyurl+"http://compose_devguide_1/api/orion/reviews/"+id, true);
    xmlhttp.send();
}


/*show restaurant reviews from a API response */
/* At this moment, show all reviews without pagination */
function showReviews(reviewsResponse)
{
	reviewsResponse= JSON.parse(reviewsResponse);
	try
	{
		if ( typeof(reviewsResponse.contextResponses[0]['contextElement'])==='undefined' || (typeof(reviewsResponse.contextResponses)==='undefined') )
		{
			document.getElementById("pop_content").innerHTML ="<h2>No reviews are available.</h2>";
			openPopUpWindow();
    	    return;
		}
	}catch(error)
	{
		document.getElementById("pop_content").innerHTML ="<h2>No reviews are available.</h2>";
			openPopUpWindow();
	}
	//list all reviews
	reviewsHtml='<div class="reviewList">\n';
	for (j=0, lim=reviewsResponse['contextResponses'].length; j < lim; j++)
	{
		review= reviewsResponse['contextResponses'][0]['contextElement'];
		for (i=0, len= review['attributes'].length; i<len;i++)
		{
			if("reviewBody" == review['attributes'][i]['name'])
				reviewBody=review['attributes'][i]['value']
			if("ratingValue" == review['attributes'][i]['name'])
				ratingValue=review['attributes'][i]['value']
		}
		reviewsHtml= reviewsHtml+ '<div class="reviewElement">\n<p>\n<span class="rating_label">Rating: </span> <span class="rating_value">' +
			ratingValue+
			'</span>\n</p>\n<p>\n<span class="review_label">Review text</spam>\n</p>\n<p class="review">'+reviewBody+'</p>\n</div>';
	}
	reviewsHtml= reviewsHtml+'\n</div>';

	
	//render the reviews
	document.getElementById("pop_content").innerHTML =reviewsHtml;
	
	openPopUpWindow();

}


/*get reservations from a restaurant an show it */
function getAndShowReservations(id)
{
    var xmlhttp;

    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
           if(xmlhttp.status == 200){
           	   document.getElementById("pop_title").innerHTML =id;
               showReservations( xmlhttp.responseText ); 
           }
           else if(xmlhttp.status == 400) {
             document.getElementById("pop_content").innerHTML ="<h2>Cannot get reservations.</h2>";
             openPopUpWindow();
             return;
           }
           else {
             document.getElementById("pop_content").innerHTML ="<h2>Cannot get reservations.</h2>";
             openPopUpWindow();
             return;
           }
        }
    }

    xmlhttp.open("GET", proxyurl+"http://compose_devguide_1/api/orion/reservations/"+id, true);
    xmlhttp.send();
}


/*show restaurant reservations from a API response */
/* At this moment, only show the reservations without pagination */
function showReservations(reservationsResponse)
{
	reservationsResponse= JSON.parse(reservationsResponse);
	try{
		if (typeof(reservationsResponse.contextResponses[0]['contextElement'])==='undefined'  
			|| (typeof(reservationsResponse.contextResponses)==='undefined')
			|| (typeof(reservationsResponse)==='undefined') )
		{
			document.getElementById("pop_content").innerHTML ="<h2>No reservations are available.</h2>";
			 openPopUpWindow();
             return;
		}
	}catch(err){
		document.getElementById("pop_content").innerHTML ="<h2>No reservations are available.</h2>";
		 openPopUpWindow();
         return;
	}
	//list all reservations
	reservationsHtml='<div class="reservationList">\n';
	for (j=0, lim=reservationsResponse['contextResponses'].length; j < lim; j++)
	{
		reservation= reservationsResponse['contextResponses'][0]['contextElement'];
		for (i=0, len= reservation['attributes'].length; i<len;i++)
		{
			if("bookingTime" == reservation['attributes'][i]['name'])
				bookingTime=reservation['attributes'][i]['value']
			if("underName" == reservation['attributes'][i]['name'])
				underName=reservation['attributes'][i]['value']
		}
		reservationsHtml= reservationsHtml+ '<div class="reservationElement">\n<p>\n<span class="reservation_time_label">Time: </span> <span class="time_value">' +
			fixBookingTime(bookingTime)+
			'</span>\n</p>\n<p>\n<span class="under_name_reservation_label">Reserved by</spam>\n</p>\n<p class="under_name_reservation">'+underName+'</p>\n</div>';
	}
	reservationsHtml= reservationsHtml+'\n</div>';

	
	//render the reservations
	document.getElementById("pop_content").innerHTML =reservationsHtml;
	
	openPopUpWindow();

}


/* aux function that open the PopUp windows */
function openPopUpWindow(){
	document.getElementById("pop_window").className = document.getElementById("pop_window").className.replace('hidden', '');
	document.getElementById("pop_window").className = document.getElementById("pop_window").className.replace('  ', ' ');
}

/*aux function that close the PopUp window */
function closePopUpWindow(){
	if (! (document.getElementById("pop_window").className.indexOf('hidden') > -1 ) )
		document.getElementById("pop_window").className = document.getElementById("pop_window").className + ' hidden';
}

/* axu function, it change the format date to print reservations */
function fixBookingTime(bookingTime){
	d= new Date(bookingTime);
	return ""+ d.toLocaleDateString()+" "+d.toLocaleTimeString();
}