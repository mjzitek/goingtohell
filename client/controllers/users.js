
var mongoose = require('mongoose'),
	User = mongoose.model('users');

var fs = require('fs');

var users = require('../../server/controllers/users');

var config = require('../../config/config');

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

	console.log(req.user);

	res.render('users/profile', {
		user : req.user,
		username: username,
		userid: userid
	})
}

exports.create = function(req, res, next) {

	var message = null;
	var msgClass = null;

	var fstream;


    var userInfo = {};

	req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
		userInfo[fieldname] = val;
		//console.log('Field [' + fieldname + ']: value: ' + val);
	});

    req.busboy.on('file', function (fieldname, file, filename) {
    	file.on('data', function(data) {
	    	try {
		        console.log("Uploading: " + filename);

		        userInfo.tempFilename = (new Date().getTime()).toString() + (Math.floor(Math.random() * 10000)).toString() + filename;

		        // keep it from getting too long
		        if(userInfo.tempFilename.length > 255) {
		        	userInfo.tempFilename = userInfo.tempFilename.substring(1,255);
		        }


		        fstream = fs.createWriteStream( config.baseFolder + config.uploadFolder + '/temp/' + userInfo.tempFilename);
		        file.pipe(fstream);
		        fstream.on('close', function() {

		        });
	    	} catch (err) {
	    		console.log(err);
	    	}
    	});

    	file.on('end',function() {});


    });

    req.busboy.on('finish', function() {
    	console.log(userInfo);

    	if(userInfo.accesscode != config.accesscode)
		{

			msgClass="alert alert-danger"
			message = 'Invalid Access Code';

			return res.render('users/signup', {
				msg_class: msgClass,
				message: message,
			});

		} else {

			users.create(userInfo, function(userCreated, user, msg) {
				console.log("User Created: " + userCreated);
				console.log(user);
				console.log(msg);
				if(!userCreated) {
					return res.render('users/signup', {
						msg_class : msg.msgClass,
						message: msg.message,
						user: user
					});
				} else {
					req.logIn(user, function(err) {
						if(err) return next(err);
						return res.redirect('/');
					});
				}
			});

		}	
    });

    req.pipe(req.busboy);
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


exports.editProfile = function(req, res) {

	users.editProfile(req.body, function(data) {
		res.send(data);
	});
}
