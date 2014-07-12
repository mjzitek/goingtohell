var auth = require('./middlewares/authorization');


var cards = require('../controllers/cards');


module.exports = function(app, models) {

	app.get('/cards/view/:color', auth.isLoggedIn, cards.listCards);
	app.get('/blackcard', auth.isLoggedIn, cards.getBlackCards);
	app.get('/whitecards/:amt', auth.isLoggedIn, cards.getWhiteCards);
	app.get('/cards/addcard', auth.isLoggedIn, auth.needsGroup("cardmaster"), cards.addCard);

	app.post('/cards/addcard', auth.isLoggedIn, auth.needsGroup("cardmaster"), cards.createCard);
	app.post('/playcard/:playerId/:cardId/:sessionId', auth.isLoggedIn, cards.play);

}

