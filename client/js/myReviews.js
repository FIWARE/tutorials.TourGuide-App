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
init_reviews = function(){

userInfo= JSON.parse(localStorage.getItem("userInfo"))
get_user_reviews(userInfo["displayName"]);


}

addLoadEvent(init_reviews);