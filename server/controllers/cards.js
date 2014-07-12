
var async = require("async");

var mongoose = require('mongoose'),
	BlackCards = mongoose.model('blackcards'),
	WhiteCards = mongoose.model('whitecards'),
	GameSession = mongoose.model('gamesession');




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
	if(cardInfo.card_type === "black")
	{
		newCard = new BlackCards({
			text: 		cardInfo.card_text,
			deck: 		cardInfo.card_category,
			createdate: new Date(),
			createdby: 	cardInfo.userid,
			active: 	true,
		});
	}
	else if(cardInfo.card_type === "white")
	{
		newCard = new WhiteCards({
			text: 		cardInfo.card_text,
			deck: 		cardInfo.card_category,
			createdate: new Date(),
			createdby: 	cardInfo.userid,
			active: 	true,
		});
	}

	if(newCard) {
		newCard.save(function(err) {
			var doc = {};
			
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
					 $set : { "players.$.lastPing" : new Date(), "players.$.afk" : false }

				},{upsert:true }, function(err, doc) { 
					if(err) { console.log(err);}
					else { callback("updated");}
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
