var async = require("async");

var mongoose = require('mongoose'),
	BlackCards = mongoose.model('blackcards'),
	WhiteCards = mongoose.model('whitecards'),
	GameSession = mongoose.model('gamesession');








/*
	Create a new game session
	
*/
exports.create = create
function create(callback) {
	var gameSessionId;

	var gameSession = new GameSession({});

	gameSessionId = gameSession._id;

	newCard.save(function(err) {
		callback(gameSessionId)
	});

}