var users = require('../controllers/users');

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}

module.exports = function(app, passport) {

	app.get('/signup', users.signup);
	app.get('/signin', users.signin);
	app.get('/signout', users.signout);
	app.get('/users/me', isLoggedIn, users.me);
	app.get('/profile', isLoggedIn, users.profile);

	app.post('/users', users.create);
	app.post('/users/session', passport.authenticate('local', {
		failureRedirect: '/signin',
		successRedirect: '/'
	}), users.session);
}