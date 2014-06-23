var mongoose = require('mongoose'),
	User = mongoose.model('users');


exports.useredit = function(req, res) {	
	res.render('admin/usereditor', {
		user : req.user
	});
}