
var async = require("async");

var mongoose = require('mongoose'),
	BlackCards = mongoose.model('blackcards'),
	WhiteCards = mongoose.model('whitecards'),
	GameSession = mongoose.model('gamesession');



exports.getBlackCards = function(req, res) {

	// populationCountFiltered(query, function (persCount) {


	// 		var ranNum = (Math.floor(Math.random() * persCount))
	// 		//console.log(ranNum);
	// 		Person.findOne(query, fields).skip(ranNum).limit(1).exec(function(err, per) {
	// 				callback(per);
	// 		});

	// });
	getRandomBlackCard("", function(card) {
		return res.jsonp(card);
	});
				
};

exports.getWhiteCards = function(req, res) {
	
	getRandomWhiteCards(req.params.amt,"", function(cards) {
		return res.jsonp(cards);
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

exports.create = function(req, res) {

	var card = req.body;
	
	console.log(card);

	if(req.user) {
		username = req.user.username;
		userid = req.user._id;
	} else {
		username = "Guest";
		userid = "";
	}

	var newCard = null;
	if(card.card_type === "black")
	{
		newCard = new BlackCards({
			text: 		card.card_text,
			deck: 		card.card_category,
			createdate: new Date(),
			createdby: 	card.userid,
			active: 	true,
		});
	}
	else if(card.card_type === "white")
	{
		newCard = new WhiteCards({
			text: 		card.card_text,
			deck: 		card.card_category,
			createdate: new Date(),
			createdby: 	card.userid,
			active: 	true,
		});
	}

	if(newCard) {
		newCard.save(function(err) {
			var message;
			var msg_class;
			if(err) {
				if (11001 === err.code || 11000 === err.code) {
					message = "A card with this text has already been added."
				} else {
					message = "A error has occured";
					console.log(err);
				}

				msg_class = "alert alert-warning";
			} else {
				message = "Card Saved";
				msg_class = "alert alert-success";
			}
			res.render("cards/addcard", {
				message: message,
				msg_class: msg_class,
				username: username,
				userid: userid,
				last_card_type: card.card_type
			});

		});
	}
}

exports.play = function(req, res) {
	console.log("Player " + req.params.playerId + 
                        " played card " + req.params.cardId + " on game " + req.params.sessionId );

	var cardId = [req.params.cardId];
	var whiteCardsActive = [{ whitecard: req.params.cardId, playerInfo: req.params.playerId }];

	GameSession.update({ _id: req.params.sessionId, "players.playerInfo" : req.params.playerId }, 
		{
			 $pushAll : { 
			 				whiteCardsPlayed :  cardId,
			 				whiteCardsActive :  whiteCardsActive 
			 },
			 $set : { "players.$.lastPing" : new Date(), "players.$.afk" : false }

	  	

		},{upsert:true }, function(err, doc) { 
			if(err) { console.log(err);}
			else { res.send("updated");}
	});

	//GameSession.find({ _id: req.params.sessionId },function(err,doc) {console.log(doc)});
}

exports.newHand = function(req, res) {
	GameSession.update({ _id: req.params.sessionId}, 
		{
			whiteCardsActive : []	  	

		},{upsert:true }, function(err, doc) { 
			if(err) { console.log(err);}
			else { res.send("updated");}
	});
}

exports.getRandomBlackCard = getRandomBlackCard;
function getRandomBlackCard(deck, callback) {

	var filter = {};

	if(deck != "") {
		filter.deck = deck;
	}
		BlackCards.count(filter, function(err, cardCount) {
			var randNum = (Math.floor(Math.random() * cardCount));
			BlackCards.findOne(filter).skip(randNum).limit(1).exec(function(err, card) {
					callback(card);
			});

		});


}

exports.getRandomWhiteCards = getRandomWhiteCards;
function getRandomWhiteCards(amount, deck, callback) {

	async.series({
		cards: function(callback) {

			var cards = [];

			var filter = {};

			if(deck != "") {
				filter.deck = deck;
			}

			for(var i = 0; i < amount; i++) {
				WhiteCards.count(filter, function(err, cardCount) {
					var randNum = (Math.floor(Math.random() * cardCount));
					
					WhiteCards.findOne(filter).skip(randNum).limit(1).exec(function(err, card) {
						cards.push(card);
						amount--;

						if(amount == 0)
			{
							callback(null, cards);
						}
					});

				});

			}



		}
	},
	function(err, results) {
		if(err) {
			callback(err);
		} else {
			callback(results);
		}
	});
}
