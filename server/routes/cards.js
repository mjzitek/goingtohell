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

function needsGroup(group) {
  return function(req, res, next) {

    if (req.user && ((req.user.groups.indexOf(group) >= 0) || (req.user.groups.indexOf("admins") >= 0)))

      next();
    else
      res.send(401, 'Unauthorized');
  };
};


module.exports = function(app, models) {

	app.get('/cards/view/:color', isLoggedIn, cards.showCards);
	app.get('/blackcard', isLoggedIn, cards.getBlackCards);
	app.get('/whitecards/:amt', isLoggedIn, cards.getWhiteCards);
	app.get('/cards/addcard', isLoggedIn, needsGroup("cardmaster"), cards.addCard);

	app.post('/cards/addcard', isLoggedIn, needsGroup("cardmaster"), cards.create);
	app.post('/playcard/:playerId/:cardId/:sessionId', isLoggedIn, cards.play);

	//app.post('/cards/winningcard', gamesession.winningcard);
	//app.post('/cards/winningcard/:sessionId/:winningPlayerId', gamesession.winningcard);

}

