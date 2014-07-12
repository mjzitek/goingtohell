exports.requiresLogin = function(req, res, next) {
	if(!req.isAuthenticated()) {
		return res.send(401, 'User is not authorized');
	}
	next();
};




// route middleware to make sure a user is logged in
exports.isLoggedIn = isLoggedIn;
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/signin');
}

exports.needsGroup = needsGroup;
function needsGroup(group) {
  return function(req, res, next) {

    if (req.user && (req.user.groups.indexOf(group) >= 0))

      next();
    else
      res.send(401, 'Unauthorized');
  };
};