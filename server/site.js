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
            res.send('Welcome '+user+'!<br><a href="/logout">Log out</a>');
        });
    }
};
