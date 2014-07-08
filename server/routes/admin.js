var admin = require('../controllers/admin');

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

// app.get('/profile', isLoggedIn, users.profile);

  app.get('/admin/usereditor/:username', isLoggedIn, needsGroup("admins"), admin.useredit);
  app.get('/admin/user/activate/:userid', isLoggedIn, needsGroup("admins"), admin.activateuser);
  //app.post('/admin/notification/:message', isLoggedIn, needsGroup("admins"), admin.sendNotification);
}