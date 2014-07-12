var mongoose = require('mongoose'),
	User = mongoose.model('users');

var config = require('../../config/config');


exports.getUserById = getUserById;
function getUserById(id, callback) {

	User.findOne({_id:id}, { username: 1, name: 1, email : 1, groups: 1, active: 1, avatarUrl: 1  }, function(err,u) {
			callback(u);
	});

};		

exports.getUserByName = getUserByName;
function getUserByName(username, callback) {
	User.findOne({username: username }, { username: 1, name: 1, email: 1, _id: 1, groups: 1, active: 1 }, 
	  function(err,user) {
		console.log(user);
		callback(user);
	});
};

exports.activateUser = activateUser;
function activateUser(playerId, callback) {
	User.update({_id: playerId }, { active : true}, function(err, doc) {
		User.findOne({_id: req.params.userid }, { username: 1, name: 1, email: 1, _id: 1, groups: 1, active: 1 }, 
		  function(err,user) {
		  	callback(user);

		});
	})
}
