'use strict';
/*
 * myReviews.js
 * Copyright(c) 2016 Universidad de Las Palmas de Gran Canaria
 * Authors:
 *   Jaisiel Santana <jaisiel@gmail.com>,
 *   Alejandro Sánchez <alemagox@gmail.com>
 *   Pablo Fernández <pablo.fernandez@ulpgc.es>
 * MIT Licensed

*/
//initialization
var init_reviews = function() {


//only gets reviews if the user is loged
login_needed(function() {
    var userInfo = JSON.parse(localStorage.getItem('userInfo'));
    get_user_reviews(userInfo['displayName']);
});


//todo translate to common js
$('tbody').height($(window).height() - $('thead th').height() -
     $('#logged_div').height() - 50);
};

addLoadEvent(init_reviews);
