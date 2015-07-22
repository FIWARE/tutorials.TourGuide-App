//global vars
var map; //map instance
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
           	console.log( xmlhttp.responseText);
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
    console.log(url);
    xmlhttp.open("GET", proxyurl+"http://compose_devguide_1/api/orion/restaurants/", true);
    xmlhttp.send();
}

/*show restaurants from the API response*/
function showRestaurants(restaurants)
{
	console.log(restaurants);
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
		restaurant_marks[i]['mark'].bindPopup("<b>"+restaurant_marks[i]['id']+"</b><br>Address: "+restaurant_marks[i]['address']+"<br>Phone: "+restaurant_marks[i]['tlf']+"<br>email: "+restaurant_marks[i]['email']+"<br>web: "+restaurant_marks[i]['web']);
	
			
		//reference all mark info for use from leaflet
		restaurant_marks[i]['mark']['extraInfo']= restaurant_marks[i];
		
		//if a mark if clicked, show reviews
		restaurant_marks[i]['mark'].on('click', function(e)
			{
    		 	getAndShowReviews(this.extraInfo.id);
			});

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
               showReviews( xmlhttp.responseText );
           }
           else if(xmlhttp.status == 400) {
              alert('Could not retrive reviews')
           }
           else {
               alert('Could not retrieve reviews')
           }
        }
    }

    xmlhttp.open("GET", proxyurl+"http://compose_devguide_1/api/orion/reviews/"+id, true);
    xmlhttp.send();
}


/*show restaurant reviews from a API response */
/* At this moment, only show the first review */
function showReviews(reviewsResponse)
{
	reviewsResponse= JSON.parse(reviewsResponse);
	if (typeof(reviewsResponse.contextResponses[0]['contextElement'])==='undefined' )
	{
		document.getElementById("rest_info").innerHTML ='No reviews are available';
	}
	//get the first element
	review= reviewsResponse['contextResponses'][0]['contextElement'];

	for (i=0, len= review['attributes'].length; i<len;i++)
	{
		if("reviewBody" == review['attributes'][i]['name'])
			reviewBody=review['attributes'][i]['value']
		if("ratingValue" == review['attributes'][i]['name'])
			ratingValue=review['attributes'][i]['value']
	}
	//render the review
	document.getElementById("rest_info").innerHTML ='<p>\n<span class="rating_label">Rating: </span> <span class="rating_value">' +
	ratingValue+
	'</span>\n</p>\n<p>\n<span class="review_label">Review text</spam>\n</p>\n<p class="review">'+reviewBody+'</p>';

}
