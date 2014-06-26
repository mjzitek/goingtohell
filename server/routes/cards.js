var cards = require('../controllers/cards');

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/signin');
}

module.exports = function(app, models) {

	app.get('/blackcard', cards.getBlackCards);
	app.get('/whitecards/:amt', cards.getWhiteCards);
	app.get('/cards/addcard', cards.addCard);

	app.post('/cards/addcard', cards.create);
	app.post('/playcard', cards.play);
}
