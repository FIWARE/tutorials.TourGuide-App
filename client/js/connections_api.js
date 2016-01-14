/*
 * connections_api.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors: 
 *   Jaisiel Santana <jaisiel@gmail.com>,
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

*/

init_connexions = function(){

  //check if user is logged in
  get_ajax_petition('http://compose_devguide_1/client/user',logged_in, not_logged_in);
}


addLoadEvent(init_connexions);




function logged_in(userInfo){
  localStorage.setItem("userInfo", userInfo);
  
  userInfo = JSON.parse(userInfo);
  html = '<div id="log_out"><p><a href="http://compose_devguide_1/logout">Log Out</a></p></div>';
  html += '\n<div id="hi_user"><p>Hi,'+userInfo["displayName"]+'!</p></div>';
  document.getElementById("logged_div").innerHTML = html;
  create_and_show_menu(userInfo);
  show_roles();
  hide_roles();
  return ;
}

function create_and_show_menu(userInfo)
{
  html = '<div id=logged_menu>';

    //check each menu element
    //TODO check roles



    //view organizations restaurants
    if( has_role(userInfo, "Restaurant Viewer") || has_role(userInfo, "Global manager") )
    {
      //we should ask before for each organization but the user hasn't yet
      html += '<div class="menu_element"><p><a href="myRestaurants.html">My restaurants</a></p></div>';
    }

    //check each menu element
    if( has_role(userInfo, "End user") )
    {
      html += '<div class="menu_element"><p><a href="myReservations.html">My Reservations</a></p></div>';
    }

    if( has_role(userInfo, "End user") )
    {
      html += '<div class="menu_element"><p><a href="myReviews.html">My reviews</a></p></div>';
    }

    html += '<div class="menu_element"><p><a href="index.html">Inicio</a></p></div>';
  html += '</div>'
  //insert menu inside logged_div
  document.getElementById("logged_div").innerHTML += html;
}

function has_role(userInfo, role)
{
  for (var index = 0, len = userInfo["roles"].length; index < len; ++index) {
    if (role == userInfo["roles"][index]["name"] )
      return true
  }
return false;
}
function not_logged_in(){
  localStorage.removeItem("userInfo");
  html = '<div id="log_in"><p><a href="http://compose_devguide_1/auth">Log in</a></p></div>';
  document.getElementById("logged_div").innerHTML = html;
  return;
}

function show_logout(){


}

function show_roles(){
  roles=JSON.parse(localStorage.getItem("userInfo"))["roles"];
  
  html = '<p> You have the roles: </p>';
  html += '\n<ul>';

 
  for(i=0, len= roles.length; i< len; i++)
  {
    html+= '\n<li>'+roles[i]["name"]+'</li>';
   
  }

  html += '\n</ul>'

  document.getElementById("roles_div").innerHTML = html;
  document.getElementById("roles_div").style.display = 'block';

  return;
}

function hide_roles(){
  document.getElementById("roles_div").innerHTML = "";
  document.getElementById("roles_div").style.display = 'none';
  return;
}
