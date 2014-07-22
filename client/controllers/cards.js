var cards = require('../../server/controllers/cards');
var gamesession = require('../../server/controllers/gamesession');
var winningpairs = require('../../server/controllers/winningpairs');

exports.listCards = function(req, res) {
	cards.listCards(req.params.color, function(cards) {
		res.render("cards/cards", {
			cards : cards,
			color: req.params.color
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
	console.log("Creating card");

	cards.createCard(req.body, function(doc) {
		sendMessage(doc);
	});
}

exports.editCard = function(req, res) {
	console.log("Updating card");

	cards.editCard(req.body, function(doc) {
		sendMessage(res, doc);
	});

}

exports.getCard = function(req, res) {
	if(req.user) {
		username = req.user.username;
		userid = req.user._id;
	} else {
		username = "Guest";
		userid = "";
	}

	cards.get(req.params.cardId, req.params.cardType, function(card) {
		console.log(card);
		res.render("cards/editcard", {
			card : card,
	 		card_text: card.card_text,
	 		username: username,
	 		userid : userid
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

exports.getWinningPairs = function(req, res) {
	winningpairs.getWinningPairs(function(pairs) {
		console.log(pairs)
		res.render("cards/winning-pairs", {
			pairs : pairs
		});
	});
}


function sendMessage(res, data) {
		var msg = {};

		msg.message = data.message;	

		switch(data.message_type) {
			case "warning": 
				msg.msg_class = "alert alert-warning";
				break;
			case "success":
				msg.msg_class = "alert alert-success";
				break;
		}

		console.log(data.message_type);
		console.log(msg.msg_class);

		res.send(msg);
}