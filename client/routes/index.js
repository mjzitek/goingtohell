var auth = require('./middlewares/authorization');

var index = require('../controllers/index');



// // route middleware to make sure a user is logged in
// function isLoggedIn(req, res, next) {

// 	// if user is authenticated in the session, carry on 
// 	if (req.isAuthenticated())
// 		return next();

// 	// if they aren't redirect them to the home page
// 	res.redirect('/signin');
// }

// function needsGroup(group) {
//   return function(req, res, next) {

//     if (req.user && (req.user.groups.indexOf(group) >= 0))

//       next();
//     else
//       res.send(401, 'Unauthorized');
//   };
// };

module.exports = function(app, models) {
	app.get('/', auth.isLoggedIn, index.getIndex);
	app.post('/setczar/:playerId', auth.isLoggedIn, auth.needsGroup("admins"), index.setCzar);
}

