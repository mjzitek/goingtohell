var async = require("async");

var mongoose = require('mongoose'),
	Users = mongoose.model('users'),
	BlackCards = mongoose.model('blackcards'),
	WhiteCards = mongoose.model('whitecards'),
	GameSession = mongoose.model('gamesession');

var cards = require('./cards'),
    gamesession = require('./gamesession'),
    users = require('./users');



/**
 * Gets the list of cards for a player in the 
 * game session
 *
 * @param  {ObjectId} sessionId
 * @param  {ObjectId} playerId
 * @return {[Array]}
 */
exports.getPlayersWhiteCards = getPlayersWhiteCards;
function getPlayersWhiteCards(sessionId, playerId, callback) {
	// First check what white cards the player already has

	GameSession.findOne( { _id: sessionId, "players.playerInfo" : playerId },
		{ "players.$.whitecards" : 1 }).populate("players.whitecards") 
		.exec(function(err, cards) {
			// console.log("Player's White Cards: ");
			// console.log(cards.players[0].whitecards);
			callback(cards.players[0].whitecards);
	});
}


// Add cards to hand





