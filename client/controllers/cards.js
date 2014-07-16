var cards = require('../../server/controllers/cards');
var gamesession = require('../../server/controllers/gamesession');

exports.listCards = function(req, res) {
	cards.listCards(req.params.color, function(cards) {
		res.render("cards/cards", {
			cards : cards
		});
	});

}

exports.addCard = function(req, res) {
	if(req.user) {
		username = req.user.username;
		userid = req.user._id;
	} else {
		username = "Guest";
		userid = "";
	}

	res.render("cards/addcard", {
		username: username,
		userid: userid
	});
}

exports.createCard = function(req, res) {

	if(req.user) {
		username = req.user.username;
		userid = req.user._id;
	} else {
		username = "Guest";
		userid = "";
	}

	cards.createCard(req.body, function(doc) {
		res.render("cards/addcard", {
			message: doc.message,
			msg_class: doc.msg_class,
			username: username,
			userid: userid,
			last_card_type: req.body.card_type
		});
	});


}

exports.getBlackCards = function(req, res) {
	cards.getRandomBlackCard("", function(card) {
		return res.jsonp(card);
	});
				
};

exports.getWhiteCards = function(req, res) {
	
	if(req.params.amt > 0)
	{
		cards.getRandomWhiteCards(req.params.amt,"", function(cards) {
			gamesession.addWhiteCardsToPlayersDeck(req.user._id, cards, function() {
				return res.jsonp(cards);
			});
			
		});		
	}
}


exports.play = function(req, res) {
	cards.play(req.params.sessionId, req.params.playerId, req.params.cardId, function(doc) {
		res.send(doc);
	});
}

exports.newHand = function(req, res) {
	cards.newHand(sessionId, function(doc) {
		res.send("updated");
	});
}