var auth = require('./auth');

exports.index = function(req, res){
    // check if user is authenticated
    if (!req.session.access_token) {
        // user is not authenticated
        res.send('<a href="/auth">Log in with your FI-WARE Account</a>');
    } else {
        // user is already authenticated
        auth.get_user_data(req, res, function(user_data){
            console.log("User_data: ", user_data);
            var res_html = user_data;
        });

        auth.get_user_data(req, res, function(user){
            console.log("user:", user.email);
            var res_html = "Welcome "+user.id+"!";
            //var token = "?token="+req.session.access_token;
            res_html += "<br><ul>";
            res_html += "<li><a href='/api/orion/restaurants/'>All Restaurants</a></li>";
            res_html += "<li><a href='/api/orion/reviews/'>All Reviews</a> (manager)</li>";
            res_html += "<li><a href='/api/orion/reservations/'>All Reservations</a> (manager)</li>";
            res_html += "</ul><br>";
            res_html += "<br><a href='/logout'>Log out</a>";
            res.send(res_html);
        });
    }
};
