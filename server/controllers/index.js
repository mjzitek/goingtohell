

var mongoose = require('mongoose'),
	User = mongoose.model('users');



exports.getIndex = function(req, res) {

	if(req.user) {
		username = req.user.username;
	} else {
		username = "Guest";
	}


	res.send("hello world");

};
