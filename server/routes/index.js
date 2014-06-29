var index = require('../controllers/index');
var gamesession = require('../controllers/gamesession');

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
	app.post('/newround/:sessionId', gamesession.newRound);
}



// exports.signup = function(req, res) {
// 	res.render('users/signup', {
// 		title: 'Sign Up',
// 		user: new User()
// 	});
// }



// ObjectId("53a8a62fc9128868687ec0ac")

// ObjectId("53a8c93f1f55d70e969cda40")