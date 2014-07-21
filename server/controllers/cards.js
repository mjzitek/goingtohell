
var async = require("async");

var mongoose = require('mongoose'),
	BlackCards = mongoose.model('blackcards'),
	WhiteCards = mongoose.model('whitecards'),
	GameSession = mongoose.model('gamesession');

var ObjectId = require('mongoose').Types.ObjectId;

var gamesession = require('./gamesession');

var config = require('../../config/config');

exports.get = getCard;
exports.getCard = getCard;
function getCard(cardId, cardType, callback) {
	console.log(cardId + " " + cardType);

	var cardDeck;

	if(cardType === "black")
	{
		cardDeck = BlackCards;
	}
	else if(cardType === "white")
	{
		cardDeck = WhiteCards;
	}	

	if(cardDeck)
	{
		cardDeck.findOne( { _id : cardId}, function(err, card) {

			var cardInfo = {};
			
			if(card) 
			{
				cardInfo.cardId = card._id;
				cardInfo.card_type = cardType;
				cardInfo.card_text = card.text;
				cardInfo.card_category = card.deck;
				cardInfo.nsfw = card.nsfw;
				cardInfo.active = card.active;			
			}

			callback(cardInfo);
		});		
	} else {
		callback("error");
	}


}


exports.listCards = listCards;
function listCards(color, callback) {

	if(color === "black") {
		BlackCards.find({}, function(err, cards) {
			callback(cards);
		});
	} else if (color === "white"){
		WhiteCards.find({}, function(err, cards) {
			callback(cards);
		});
	}
}


exports.create = createCard;
exports.createCard = createCard;
function createCard(cardInfo, callback) {
	console.log(cardInfo);

	var newCard = null;
	var cardDeck;
	
	if(cardInfo.card_type === "black")
	{
		cardDeck = BlackCards;
	}
	else if(cardInfo.card_type === "white")
	{
		cardDeck = WhiteCards;
	}

	if(cardDeck) {
		newCard = new cardDeck({
			text: 		cardInfo.card_text,
			deck: 		cardInfo.card_category,
			nsfw:       cardInfo.nsfw,			
			createdate: new Date(),
			createdby: 	cardInfo.userid,
			active: 	cardInfo.active,
		});
	}

	if(newCard) {
		newCard.save(function(err) {
			var doc = {};

			doc.cardId = newCard._id;
			
			if(err) {
				if (11001 === err.code || 11000 === err.code) {
					doc.message = "A card with this text has already been added."
				} else {
					doc.message = "A error has occured";
					console.log(err);
				}
				doc.msg_class = "alert alert-warning";
				callback(doc);
			} else {
				doc.message = "Card Saved";
				doc.msg_class = "alert alert-success";
				callback(doc);
			}
		});
	} else {
		callback("");
	}
}

exports.edit = editCard;
exports.editCard = editCard;
function editCard(cardInfo, callback) {
	var cardDeck;

	if(cardInfo.card_type === "black")
	{
		cardDeck = BlackCards;
	}
	else if(cardInfo.card_type === "white")
	{
		cardDeck = WhiteCards;
	}

	if(cardDeck) {
		cardDeck.update({ _id: cardInfo._id }, 
		{
			text: 	cardInfo.card_text,
			deck: 	cardInfo.card_category,
			active: cardInfo.active,
			nsfw: 	cardInfo.nsfw,
			editdate: new Date(),
			editedby: cardInfo.user_info
		}, function(doc) {
			var data = {};
			
			if(doc === 1)
			{
				data.message = "Card Saved";
				data.msg_class = "alert alert-success";
			} else {
				data.message = "Error updating card";
				data.msg_class = "alert alert-warning";
			}
			callback(data);

		});		
	}


}

exports.play = function(sessionId, playerId, cardId, callback) {

	console.log("Player " + playerId + 
                        " played card " + cardId + " on game " + sessionId );

	var cardId = [cardId];
	var whiteCardsActive = [{ whitecard: cardId, playerInfo: playerId }];

	//console.log(whiteCardsActive);

	GameSession.findOne({ _id: sessionId, "whiteCardsActive.playerInfo" : playerId}, function(err,doc) {
		if(doc === null) {
			GameSession.update({ _id: sessionId, "players.playerInfo" : playerId }, 
				{
					 $pushAll : { 
					 				whiteCardsPlayed :  cardId,
					 				whiteCardsActive :  whiteCardsActive 
					 },
					 $set : { "players.$.lastPing" : new Date(), "players.$.afk" : false },
					 $pullAll : { "players.$.whitecards" : cardId }

				},{upsert:true, multi: true }, function(err, doc) { 
					if(err) { console.log(err);}
					else { 
						console.log("Play: " + doc);
						callback("updated");
					}
			});			
		}
	});
}

exports.newHand = function(sessionId, callback) {
	GameSession.update({ _id: sessionId}, 
		{
			whiteCardsActive : []	  	

		},{upsert:true }, function(err, doc) { 
			if(err) { console.log(err);}
			else { callback("updated"); }
	});
}

////////////////////////////////////////////////////////////////////////////////////////////////

exports.getRandomBlackCard = getRandomBlackCard;
function getRandomBlackCard(deck, callback) {

	var filter = {};

	if(deck != "") {
		filter.deck = deck;
	}

	// BlackCards.count(filter, function(err, cardCount) {
	// 	var randNum = (Math.floor(Math.random() * cardCount));
	// 	BlackCards.findOne(filter).skip(randNum).limit(1).exec(function(err, card) {
	// 			callback(card);
	// 	});

	// });

	async.waterfall([
		function(callback) {
			var cardsPlayed = [];
			GameSession.findOne({}, function(err, gs) {
				gs.blackCardsPlayed.forEach(function(card) {
					cardsPlayed.push(card);
				});

				callback(null, cardsPlayed);
			});

		},
		function(cardsPlayed, callback) {
			var filter = {};

			filter['_id'] = { '$nin' : cardsPlayed }

			BlackCards.count(filter, function(err, cardCount) {
				console.log(cardCount);
				callback(null, cardsPlayed, cardCount);
			});
		},
		function(cardsPlayed, cardCount, callback) {
			GameSession.aggregate( [
        		{ $unwind: '$blackCardsPlayed' },
        		{ $group : { _id : {  }, 
        			count : { $sum : 1 }}}
    		], function(err, blackCardsPlayed) {
    			//console.log(cardsPlayedCount);
    			var cardsPlayedCount = (blackCardsPlayed[0] ? blackCardsPlayed[0].count : 0);
    			callback(null, cardsPlayed, cardCount, cardsPlayedCount);
    		});	
		},

		function(cardsPlayed, cardCount, cardsPlayedCount, callback) {

			var cards = [];
			var filter = {};

			filter['_id'] = { '$nin' : cardsPlayed }


			if(deck != "") {
				filter.deck = deck;
			}

			if(cardsPlayedCount > (cardCount * .9)) // if 90% of cards have been played then reset
			{
				 gamesession.resetPlayedBlackCards(config.gameSessionId, function(doc) { });
			}
	
			var randNum = (Math.floor(Math.random() * cardCount));



			BlackCards.findOne(filter).skip(randNum).limit(1).exec(function(err, card) {
				// console.log("Blackcard Found: ");
				// console.log(randNum);
				// console.log(card);
				// console.log("+++++++++");
				callback(null, card);
			});


		}
	],
	function(err, card) {
		//console.log(cards);
		if(err) {
			callback(err);
		} else {
			callback(card);
		}
	});
}

exports.getRandomWhiteCards = getRandomWhiteCards;
function getRandomWhiteCards(amount, deck, callback) {

	async.waterfall([
		function(callback) {
			var cardsPlayed = [];
			GameSession.findOne({}, function(err, gs) {
				gs.whiteCardsPlayed.forEach(function(card) {
					cardsPlayed.push(card);
				});

				callback(null, cardsPlayed);
			});

		},
		function(cardsPlayed, callback) {
			var filter = {};

			filter['_id'] = { '$nin' : cardsPlayed }

			WhiteCards.count(filter, function(err, cardCount) {
				callback(null, cardsPlayed, cardCount);
			});
		},
		function(cardsPlayed, cardCount, callback) {
			GameSession.aggregate( [
        		{ $unwind: '$whiteCardsPlayed' },
        		{ $group : { _id : {  }, 
        			count : { $sum : 1 }}}
    		], function(err, cardsPlayedCount) {
    			//console.log(cardsPlayedCount);
    			cardsPlayedCount = (cardsPlayedCount[0] ? cardsPlayedCount[0].count : 0)

    			callback(null, cardsPlayed, cardCount, cardsPlayedCount);
    		});	
		},

		function(cardsPlayed, cardCount, cardsPlayedCount,  callback) {
			console.log("Total White Cards: " + cardCount);
			console.log("White Cards Played: " + cardsPlayedCount);
			//console.log(cardsPlayed);

			var cards = [];

			var filter = {};

			filter['_id'] = { '$nin' : cardsPlayed }


			if(deck != "") {
				filter.deck = deck;
			}
									// 
			if(cardsPlayedCount > (cardCount * .9)) // if 90% of cards have been played then reset
			{
				 gamesession.resetPlayedWhiteCards(config.gameSessionId, function() { });
			}

			for(var i = 0; i < amount; i++) {
				//WhiteCards.count(filter, function(err, cardCount) {
					var randNum = (Math.floor(Math.random() * cardCount));
					
					WhiteCards.findOne(filter).skip(randNum).limit(1).exec(function(err, card) {
						if(card) {
							cards.push(card);
							amount--;
						}

						if(amount == 0)
						{
							callback(null, cards);
						}
					});

				//});

			}


		}
	],
	function(err, cards) {
		//console.log(cards);
		if(err) {
			callback(err);
		} else {
			callback(cards);
		}
	});
}

