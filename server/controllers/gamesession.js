var async = require("async");
var _ = require("underscore");
var moment = require("moment");

var timeHelper = require("../helpers/time.js");

var mongoose = require('mongoose'),
	Users = mongoose.model('users'),
	BlackCards = mongoose.model('blackcards'),
	WhiteCards = mongoose.model('whitecards'),
	GameSession = mongoose.model('gamesession');



var cards = require('./cards');

var gameSessionId = "53ac67251f55d70e969cda55";


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


exports.addPlayer = function(gameSessionId,player, callback) {
	//console.log(gameSessionId);
	//console.log(player);

	Users.findOne({username: player}, function(err,p) {
	
		var player = [{ playerInfo: p._id, points: 0, whitecards: [], afk: false, lastPing: new Date() }]

		GameSession.findOne({ "players.playerInfo" :  p._id }, function(err, pp) {
			//console.log(pp);
			if(!pp)
			{

				GameSession.update({ _id: gameSessionId},
					{
						$pushAll : { players : player } 
					},{upsert:true }, function(err, doc) { 
						if(err) { console.log(err); callback(err);}
						else { callback('updated')}

				});
			}
		});

	});
}


exports.getPlayerList = function(gameSessionId, callback) {
	GameSession.findOne( {_id: gameSessionId}, 
	 { "players.playerInfo" : 1, "players.points" : 1, "players.afk" : 1, "players.lastPing" : 1, "currentCardCzar" : 1})
	 .populate("players.playerInfo", "username avatarUrl").exec(function(err, playersInfo) {
		if(err) {
			callback(err);
		}else {
			var playersList = [];
			//console.log(playersInfo);

		 //    playersInfo.players.forEach(function(player) {
		 //    		console.log(player);
		 //    		console.log(player.playerInfo);
			// });

			playersInfo.players.forEach(function(p) {
				var player = {};
				player.id = p.playerInfo._id;
				player.username = p.playerInfo.username;
				player.avatarUrl = p.playerInfo.avatarUrl;
				player.points = p.points;
				player.lastPing = p.lastPing;

				var idleTime = (new Date().getTime() - p.lastPing.getTime())/1000;

				if(p.afk) {
					player.status = 'AFK';
				} else if(idleTime >= 300) {
					player.status = 'Idle'
				}  else if (playersInfo.currentCardCzar.equals(p.playerInfo._id)) {
					player.status = 'Card Czar';
				} else {
					player.status = '';
				}


				playersList.push(player);
			});

			callback(playersList);
		}
	});
}

exports.updatePlayerAFK = function(gameSessionId,player, afk, callback) {
	Users.findOne({username: player}, {username: 1 }, function(err,p) {
	
		//var player = [{ playerInfo: p._id, points: 0, whitecards: [], afk: false, lastPing: new Date() }]
		//console.log(p);
		//console.log(gameSessionId);
		GameSession.update({ _id: gameSessionId, "players.playerInfo" : p._id },
			{
				$set : { "players.$.afk" : true }
			},
			{upsert:false }, function(err, doc) { 
				if(err) { console.log(err); callback(err);}
				else { 
					console.log("AFK Updated: " + doc);
					callback('updated')
				}

		});
	
	});
}

exports.updatePlayerPingTime = function(gameSessionId,player,callback) {
	Users.findOne({username: player}, {username: 1 }, function(err,p) {
		GameSession.update({ _id: gameSessionId, "players.playerInfo" : p._id },
			{
				$set : { "players.$.lastPing" : new Date(), "players.$.afk" : false }
			},
			{upsert:false }, function(err, doc) { 
				if(err) { console.log(err); callback(err);}
				else { 
					console.log("AFK Updated: " + doc);
					callback('updated')
				}

		});
	});
}

exports.newRound = newRound;
function newRound(gameSessionId, callback) {
	cards.getRandomBlackCard("", function(blackCard) {
	//	console.log(blackCard);
		getNextCardCzar(function(cardCzar) {
			GameSession.update({ _id:  gameSessionId},
				{
					$inc : { 	roundsPlayed : 1 },
					$set : { 
								whiteCardsActive : [], 
								blackCardActive : blackCard._id,
								currentCardCzar : cardCzar
						   }  
				},
				{upsert:false }, function(err, doc) { 
					if(err) { 
						console.log(err); 
						callback(err);
					}
					else { 
						console.log("New Round: " + doc);

							callback('updated');
						
						

					}

			});
		});
	});
	
}

exports.getActiveCards = function(gameSessionId, callback) {
	GameSession.find({ _id: gameSessionId}, 
		{ roundsPlayed : 1, nsfwMode: 1, currentCardCzar : 1, blackCardActive: 1, whiteCardsActive: 1})
	.populate("blackCardActive whiteCardsActive.whitecard").exec(function(err, cards) {
		if(err) {
			callback(err);
		} else {
			callback(cards);
		}
	});
}

//  /cards/winningcard/:sessionId/:winningCardId/:winningPlayerId/:playedById
// exports.winningcard = function(sessionId, winningCardId, winningPlayerId, playedById) {

//53ac67251f55d70e969cda55/53ab82bcedeb7c4f27a42225 

exports.winningCard = function(data, callback) {
	// Announce winner

	// Update points
//	console.log("Session ID: " + req.params.sessionId);
//	console.log("Player Info: " + req.params.winningPlayerId);
// Session ID: 53ac67251f55d70e969cda55
// Player Info: 53ab82bcedeb7c4f27a42225
// Winner Updated: 0



	GameSession.update({ _id: data.sessionId, "players.playerInfo" : data.winningPlayerId },
		{
			$inc : { "players.$.points" : 1, roundsPlayed : 1 },
		},
		{upsert:false }, function(err, doc) { 
			if(err) { console.log(err); callback(err);}
			else { 
				console.log("Winner Updated: " + doc);

				newRound(gameSessionId, function(data) {
					callback('updated');
				});
					

				
			}

	});


	// Select next card czar



}


function getNextCardCzar(callback) {
	GameSession.findOne({ _id: gameSessionId},
	{ "players.playerInfo" : 1, "players.points" : 1, "players.afk" : 1, "players.lastPing" : 1, "currentCardCzar" : 1},
	function(err, gameInfo) {
		console.log(gameInfo);
		var czarIndex = -1
			for(var i = 0; i < gameInfo.players.length; i++) {
			   if(gameInfo.players[i].playerInfo.equals(gameInfo.currentCardCzar)) {
			     czarIndex = i;
			   }
			}
		console.log("Current Card Czar: " + czarIndex);
		if(czarIndex + 1 >= gameInfo.players.length) 
		{ czarIndex = 0 } 
		else {
			czarIndex++;
		}

		var nextCardCzarId = gameInfo.players[czarIndex].playerInfo
		while(gameInfo.players[czarIndex].afk === true) {
			if(czarIndex + 1 >= gameInfo.players.length) { 
				czarIndex = 0 
			} else {
				czarIndex++;
			}
		} 

	callback(gameInfo.players[czarIndex].playerInfo);
		
	})
}