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
  get_ajax_petition('http://compose_tourguide_1/client/user',logged_in, not_logged_in);
}


addLoadEvent(init_connexions);




function logged_in(userInfo){
  localStorage.setItem("userInfo", userInfo);
  
  userInfo = JSON.parse(userInfo);
  html = '<ul class="nav navbar-nav pull-right" id="log_out_menu">';
  html += '\n<li class="menu_element" id="hi_user"><p>Hi,'+userInfo["displayName"]+'!</p></li>';
   html += '<li class="menu_element" id="log_out" ><a href="http://compose_tourguide_1/logout">Log Out</a></li>';
  html += '</ul>'
  document.getElementById("logged_div").innerHTML = html;
  create_and_show_menu(userInfo);
  show_roles();
  hide_roles();
  return ;
}

function create_and_show_menu(userInfo)
{
  html = '<ul class="nav navbar-nav pull-left" id="logged_menu">';

    //check each menu element
    //TODO check roles

    console.log(userInfo);
    html += '<li class="menu_element"><a href="index.html">Home</a></li>';

    //check each menu element

    //view organizations restaurants
    if( has_role(userInfo, "Restaurant Viewer") || has_role(userInfo, "Global manager") || true )//hacked
    {
      //we should ask before for each organization but the user hasn't yet
      //html += '<li class="menu_element"><a href="myRestaurants.html">My restaurants</a></li>';
      if (userInfo.organizations.length > 0)
      {
        html += '<li class="dropdown">\n';
        html += '<a  id="myRestaurantsButtonLink" class="dropdown-toggle" data-toggle="dropdown" role="button" href="#">';
        html += 'My restaurants <b class="caret"></b></a>\n';
        html += '<ul class ="dropdown-menu" aria-labelledby="myRestaurantsButtonLink" role="menu">';
          //html += '<li role="presentation">';
          //html += '<a href="myRestaurants.html" tabindex="-1" role="menuitem">All my restaurants</a></li>';
        for (var index=0; index < userInfo.organizations.length; index++)
        {
          html += '<li role="presentation">';
            html += '<a href="myRestaurants.html?franchise='+userInfo.organizations[index]["name"]
            +'" tabindex="-1" role="menuitem">'+userInfo.organizations[index]["name"]+'</a>';
          html += '</li>';
        }
       
        html += '</ul>';
        html += '</li>';
      }
    }

    if( has_role(userInfo, "End user") )
    {
      html += '<li class="menu_element"><a href="myReservations.html">My Reservations</a></li>';
    }

    if( has_role(userInfo, "End user") )
    {
      html += '<li class="menu_element"><a href="myReviews.html">My reviews</a></li>';
    }


  html += '</ul>'
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
  html = '<div id="log_in"><p><a href="http://compose_tourguide_1/auth">Log in</a></p></div>';
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
