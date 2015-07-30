var auth = require('./auth');

exports.index = function(req, res){
    // check if user is authenticated
    if (!req.session.access_token) {
        // user is not authenticated
        res.send('<a href="/auth">Log in with your FI-WARE Account</a>');
    } else {
        // user is already authenticated
        auth.get_username(req, res, function(user){
            console.log("user:", user);
            var res_html = "Welcome "+user+"!";
            var token = "?token="+req.session.access_token;
            res_html += "<br><ul>";
            res_html += "<li><a href='/api/orion/restaurants/"+token+"'>All Restaurants</a></li>";
            res_html += "<li><a href='/api/orion/reviews/"+token+"'>All Reviews</a> (manager)</li>";
            res_html += "<li><a href='/api/orion/reservations/"+token+"'>All Reservations</a> (manager)</li>";
            res_html += "</ul><br>";
            res_html += "<br><a href='/logout'>Log out</a>";
            res.send(res_html);
        });
    }
};
