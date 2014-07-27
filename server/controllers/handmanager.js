var async = require("async");

var mongoose = require('mongoose'),
	Users = mongoose.model('users'),
	BlackCards = mongoose.model('blackcards'),
	WhiteCards = mongoose.model('whitecards'),
	GameSession = mongoose.model('gamesession');

var cards = require('./cards'),
    gamesession = require('./gamesession'),
    users = require('./users');

var config = require('../../config/config');

/**
 * Gets the list of white cards for a player in the 
 * game session
 *
 * @param  {ObjectId} gameSessionId
 * @param  {ObjectId} playerId
 * @return {[Array]}
 */
exports.get = getPlayersWhitecards;
exports.getPlayersWhitecards = getPlayersWhitecards;
function getPlayersWhitecards(gameSessionId, playerId, callback) {
	console.log("Getting white cards for " + playerId);
	managePlayersWhiteCards(gameSessionId, playerId, function(doc) {
		GameSession.findOne( { _id: gameSessionId, "players.playerInfo" : playerId },
			{ "players.$.whitecards" : 1 }).populate("players.whitecards") 
			.exec(function(err, cds) {
				var cc = [];

				cds.players[0].whitecards.forEach(function(card) {
					cc.push(card);
				});

				if(cc.length > config.handCount) {
					cc = cc.splice(0,config.handCount);
				}
				callback(cc);
		});

	});

}
/**
 * Make sure the player has the correct # of cards
 *
 * @param  {ObjectId} gameSessionId
 * @param  {ObjectId} playerId
 * @return {int}
 */
exports.manage = managePlayersWhiteCards;
exports.managePlayersWhiteCards = managePlayersWhiteCards;
function managePlayersWhiteCards(gameSessionId, playerId, callback) {
	console.log("Managing cards for " + playerId);
	async.waterfall([
		function(callback) {
			checkPlayersWhitecardsCount(gameSessionId, playerId, function(cardCount) {
				callback(null, cardCount);
			});

		},
		function(cardCount, callback) {
			if(!cardCount.correctCount) {
				if(cardCount.count < cardCount.neededCount) {
					console.log("Need " + (cardCount.neededCount - cardCount.count) + " cards for " + playerId);
					cards.getRandomWhiteCards((cardCount.neededCount - cardCount.count), "", 
						function(newCards) {
							addWhitecardsToPlayersDeck(gameSessionId, playerId, newCards, function(doc) {
								callback(null, doc);
							});
					});
				} 
			} else {
				callback(null, cardCount);
			}
		}
	],
	function(err, playerCards) {
		//console.log(cards);

		if(err) {
			callback(err);
		} else {
			callback(true);
		}
	});	
}	







/**
 * Adds cards to a player's hand
 *
 * @param  {ObjectId} gameSessionId
 * @param  {ObjectId} playerId
 * @param  {Array} cards
 * @return {int}  1 or 0
 */
exports.add = addWhitecardsToPlayersDeck;
exports.addWhitecardsToPlayersDeck = addWhitecardsToPlayersDeck;
function addWhitecardsToPlayersDeck(gameSessionId, playerId, cards, callback) {


	var c = [];

	cards.forEach(function( card ) {
		if(card)
			c.push(card._id);
	});

	GameSession.update({ _id: gameSessionId, "players.playerInfo" : playerId },
		{
			$push : { "players.$.whitecards" : { $each : c  } }
		},
		{upsert:false }, function(err, doc) { 
			if(err) { console.log(err); callback(err);}
			else { 
				callback(doc);
			}
	});
}

/**
 * Clears a players hand
 *
 * @param  {ObjectId} gameSessionId
 * @param  {ObjectId} playerId
 * @return {int} 1 or 0
 */
exports.clear = clearPlayersWhitecards;
exports.clearPlayersWhitecards = clearPlayersWhitecards;
function clearPlayersWhitecards(gameSessionId, playerId, callback) {
	GameSession.update({ _id: gameSessionId, "players.playerInfo" : playerId },
		{
			$push : { "players.$.whitecards" : { $each : c  } }
		},
		{upsert:false }, function(err, doc) { 
			if(err) { console.log(err); callback(err);}
			else { 
				callback(doc);
			}
	});
}

/**
 * Checks a players hand for the correct # of cards
 *
 * @param  {ObjectId} gameSessionId
 * @param  {ObjectId} playerId
 * @return {object} 
 */
exports.checkCount = checkPlayersWhitecardsCount;
exports.checkPlayersWhitecardsCount = checkPlayersWhitecardsCount;
function checkPlayersWhitecardsCount(gameSessionId, playerId, callback) {
	GameSession.findOne( { _id: gameSessionId, "players.playerInfo" : playerId },
		{ "players.$.whitecards" : 1 }).populate("players.whitecards") 
		.exec(function(err, gs) {

			var cardCount = (gs ? gs.players[0].whitecards.length : 0);
			var cardInfo = {};

			if(!cardCount) cardCount = 0;

			cardInfo.count = cardCount;
			cardInfo.neededCount = config.handCount;

			if(cardCount === config.handCount) {
				cardInfo.correctCount = true;
			} else {
				cardInfo.correctCount = false;
			}

			callback(cardInfo);
	});
}







