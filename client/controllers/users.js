



exports.authCallback = function(req, res) {
	res.redirect('/');
}

exports.signin = function(req, res) {
	res.render('users/signin', {
		title: 'Sign In',
		message: "foo"
	});
}

exports.signup = function(req, res) {
	res.render('users/signup', {
		title: 'Sign Up',
		user: new User()
	});
}

exports.profile = function(req, res) {
	if(req.user) {
		username = req.user.username;
		userid = req.user._id;
	} else {
		username = "Guest";
	}

	//console.log(req.user);


	res.render('users/profile', {
		user : req.user,
		username: username,
		userid: userid
	})
}

exports.create = function(req, res, next) {

	var message = null;
	var msg_class = null;



	if(req.body.accesscode != config.accesscode)
	{

		msg_class="alert alert-danger"
		message = 'Invalid Access Code';

		return res.render('users/signup', {
			msg_class: msg_class,
			message: message,
		});

	} else {

		var user = new User(req.body);
		user.provider = 'local';
		user.save(function(err) {
			if (err) {
				switch (err.code) {
					case 11000:
					case 11001:
						msg_class="alert alert-danger"
						message = 'Username already exists';
						break;
					default:
						msg_class="alert alert-warning"
						message = 'Please fill all the required fields';
				}

				return res.render('users/signup', {
					msg_class : msg_class,
					message: message,
					user: user
				});
			}
			req.logIn(user, function(err) {
				if(err) return next(err);
				return res.redirect('/');
			});		
		});
	}	
}


exports.signout = function(req, res) {
	req.logout();
	res.redirect('/');
}

exports.session = function(req, res) {
	res.redirect('/');
}

exports.me = function(req, res) {
	res.jsonp(req.user || null);
}

exports.getUsers = function(callback) {

	User.find({}, function(err,doc) {
			callback(doc);
	});

};
