var auth = require('./middlewares/authorization');

var users = require('../controllers/users');


module.exports = function(app, passport) {

	app.get('/signup', users.signup);
	app.get('/signin', users.signin);
	app.get('/signout', users.signout);
	app.get('/users/me', auth.isLoggedIn, users.me);
	app.get('/profile', auth.isLoggedIn, users.profile);

	app.post('/users', users.create);
	app.post('/users/session', passport.authenticate('local', {
		failureRedirect: '/signin',
		successRedirect: '/'
	}), users.session);
	app.post('/users/profile/edit/', auth.isLoggedIn, users.editProfile);
}