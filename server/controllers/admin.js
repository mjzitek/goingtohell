var mongoose = require('mongoose'),
	User = mongoose.model('users'),

var gamesession = require('../controllers/gamesession');


exports.useredit = function(req, res) {	
	console.log("XXX");
	console.log(req.params);
	console.log(req.params.username);

	User.findOne({username: req.params.username }, { username: 1, name: 1, email: 1, _id: 1, groups: 1, active: 1 }, 
	  function(err,user) {
		console.log(user);
		res.render('admin/usereditor', {
			user : user
		});
	});

}


exports.activateuser = function(req, res) {

	User.update({_id: req.params.userid}, { active : true}, function(err, doc) {
		User.findOne({_id: req.params.userid }, { username: 1, name: 1, email: 1, _id: 1, groups: 1, active: 1 }, 
		  function(err,user) {
			console.log(user);
			res.render('admin/usereditor', {
				user : user
			});
		});
	})
}



exports.resetplayers = function(req, res) {

	gamesession.resetPlayers(function(doc) {
		res.send("updated");
	});
}