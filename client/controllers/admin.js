var gamesession = require('../../server/controllers/gamesession'),
	users  = require('../../server/controllers/users');


exports.useredit = function(req, res) {	
	users.getUserByName(req.params.username, function(user) {
		res.render('admin/usereditor', {
			user : user
		});
	});
}


exports.activateuser = function(req, res) {
	gamesession.activateUser(req.params.userid, function(user) {
		res.render('admin/usereditor', {
			user : user
		});
	});
}

exports.resetplayers = function(req, res) {
	gamesession.resetPlayers(function(doc) {
		res.send("updated");
	});
}