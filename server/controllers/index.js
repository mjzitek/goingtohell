

var mongoose = require('mongoose'),
	User = mongoose.model('users');



exports.getIndex = function(req, res) {
	//console.log(req.user);
	if(req.user) {
		username = req.user.username;
		userid = req.user._id;
	} else {
		username = "Guest";
	}

	req.session.test = 'test';


	console.log("Session Test: " + req.session.test);
	res.render("index", {
		username: username,
		userid: userid
	});

};




	// if(req.user) {
	// 	username = req.user.username;
	// } else {
	// 	username = "Guest";
	// }


	// villages.getVillageForUser(req.user._id, function(village) {	
	//    console.log(village);	
	// 	res.render('index', {
	// 		title: 'The Village',
	// 		username: username,
	// 		village: village
	// 	});
	// });
