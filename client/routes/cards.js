var auth = require('./middlewares/authorization');


var cards = require('../controllers/cards');


module.exports = function(app, models) {

	app.get('/cards/view/:color', auth.isLoggedIn, cards.listCards);
	app.get('/blackcard', auth.isLoggedIn, cards.getBlackCards);
	app.get('/whitecards/:amt', auth.isLoggedIn, cards.getWhiteCards);
	app.get('/cards/addcard', auth.isLoggedIn, auth.needsGroup("cardmaster"), cards.addCard);
	app.get('/cards/winning-pairs', auth.isLoggedIn, cards.getWinningPairs);
	
	app.get('/cards/edit/:cardId/:cardType', auth.isLoggedIn, auth.needsGroup("cardmaster"), cards.getCard)

	app.post('/cards/addcard', auth.isLoggedIn, auth.needsGroup("cardmaster"), cards.createCard);
	app.post('/playcard/:playerId/:cardId/:sessionId', auth.isLoggedIn, cards.play);

	app.post('/cards/edit/', auth.isLoggedIn, auth.needsGroup("cardmaster"), cards.editCard);

	// Aliases
	app.get('/cards/add', function(req, res) {  res.redirect('/cards/addcard'); });

}

