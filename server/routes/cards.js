var cards = require('../controllers/cards'),
  gamesession = require('../controllers/gamesession');

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/signin');
}

module.exports = function(app, models) {

	app.get('/blackcard', isLoggedIn, cards.getBlackCards);
	app.get('/whitecards/:amt', isLoggedIn, cards.getWhiteCards);
	app.get('/cards/addcard', isLoggedIn, cards.addCard);

	app.post('/cards/addcard', isLoggedIn, cards.create);
	app.post('/playcard/:playerId/:cardId/:sessionId', isLoggedIn, cards.play);

	//app.post('/cards/winningcard', gamesession.winningcard);
	//app.post('/cards/winningcard/:sessionId/:winningPlayerId', gamesession.winningcard);

}

