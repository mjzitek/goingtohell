var index = require('../controllers/index');

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/signin');
}

function needsGroup(group) {
  return function(req, res, next) {

    if (req.user && (req.user.groups.indexOf(group) >= 0))

      next();
    else
      res.send(401, 'Unauthorized');
  };
};

module.exports = function(app, models) {

	app.get('/', isLoggedIn, index.getIndex);

	// app.get('/', isLoggedIn, function(req, res){



	// 	if(req.user) {
	// 		username = req.user.username;
	// 	} else {
	// 		username = "Guest";
	// 	}

	// 	res.render('index', {
	// 		title: 'The Village',
	// 		username: username
	// 	});
	// });


}



// exports.signup = function(req, res) {
// 	res.render('users/signup', {
// 		title: 'Sign Up',
// 		user: new User()
// 	});
// }

