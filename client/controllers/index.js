

var mongoose = require('mongoose'),
	User = mongoose.model('users');

var gamesession = require('../../server/controllers/gamesession');

exports.getIndex = function(req, res) {

	if(req.user) {
		username = req.user.username;
		userid = req.user._id;
	} else {
		username = "Guest";
	}

	res.render("index", {
		username: username,
		userid: userid
	});

};

exports.setCzar = function(req, res) {
	gamesession.setCzar(req.params.playerId, function(doc) {
		res.send("updated");
	});
						

}