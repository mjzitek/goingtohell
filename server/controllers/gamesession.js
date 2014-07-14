var async = require("async");
var _ = require("underscore");
var moment = require("moment");

var timeHelper = require("../helpers/time.js");
var config = require('../../config/config');

var mongoose = require('mongoose'),
	Users = mongoose.model('users'),
	BlackCards = mongoose.model('blackcards'),
	WhiteCards = mongoose.model('whitecards'),
	GameSession = mongoose.model('gamesession');



var cards = require('./cards');

var gameSessionId = "53ac67251f55d70e969cda55";


/**
 * Creates a new game session
 *
  * @return {ObjectId}
 */
exports.create = create
function create(callback) {
	var gameSessionId;

	var gameSession = new GameSession({});

	gameSessionId = gameSession._id;

	gameSession.save(function(err) {
		if(err) {
			callback(err);
		} else {
			callback(gameSessionId)
		}
	});

}

exports.get = getGameSessionById;
exports.getGameSessionById = getGameSessionById;
function getGameSessionById(gameSessionId, callback) {
	//console.log(gameSessionId);
	GameSession.findOne( { _id: gameSessionId }, function(err, game) {
		//console.log(game);
		callback(game);
	})
}

/**
 * Removes specified game session
 *
 * @param  {ObjectId} gameSessionId
 * @return {String}
 */
exports.remove = remove
function remove(gameSessionId, callback) {
	GameSession.remove({ _id: gameSessionId}, function(err, doc) {
		if(err) {
			callback(err)
		} else {
			callback("removed");			
		}

	});
}

/**
 * Add's a player to the specified game session
 *
 * @param  {ObjectId} gameSessionId
 * @param  {String}   player 		Player name
 * @return {String}
 */
exports.addPlayer = function(gameSessionId,player, callback) {
	//console.log(gameSessionId);
	//console.log(player);

	Users.findOne({username: player}, function(err,p) {
		//console.log(p._id);
		var player = [
						{ 
							playerInfo: p._id, 
							points: 0, 
							whitecards: [], 
							afk: true,
							connected: false,
							lastPing: new Date() 
						}
					 ]

		GameSession.findOne({ "players.playerInfo" :  p._id }, function(err, pp) {
			//console.log(pp);
			if(!pp)
			{

				GameSession.update({ _id: gameSessionId},
					{
						$pushAll : { players : player } 
					},{upsert:true }, function(err, doc) { 
						if(err) { console.log(err); callback(err);}

						else { callback(doc)}

				});
			} else {
				updatePlayerRoomStatus(gameSessionId, p._id, true, function(err, doc) {
					callback(doc);
				});
			}
		});

	});
}

exports.updatePlayerRoomStatus = updatePlayerRoomStatus;
function updatePlayerRoomStatus(gameSessionId, playerId, inRoom, callback) {
		GameSession.update({ _id: gameSessionId, "players.playerInfo" : playerId },
			{
				$set : { "players.$.connected" : inRoom }
			},
			{upsert:false }, function(err, doc) { 
				callback(doc);
			}
		);
}

exports.getPlayerList = function(gameSessionId, callback) {
	GameSession.findOne( {_id: gameSessionId}, 
	 { "players.playerInfo" : 1, "players.points" : 1, "players.afk" : 1, "players.lastPing" : 1, 
	   "players.connected" : 1, "currentCardCzar" : 1, "whiteCardsActive" : 1 })
	 .populate("players.playerInfo", "username avatarUrl").exec(function(err, playersInfo) {
		if(err) {
			callback(err);
		}else {
			var playersList = [];
			var playersPlayedCards = [];

			playersInfo.whiteCardsActive.forEach(function(c) {
				//console.log(c.playerInfo);
				playersPlayedCards.push(c.playerInfo);
			});

			//console.log(playersPlayedCards);

			//console.log(playersInfo);

			playersInfo.players.forEach(function(p) {
				//console.log(p);
				//console.log(p.playerInfo.username + " => " + p.connected);
				if(p.connected) {
					var player = {};
					player.id = p.playerInfo._id;
					player.username = p.playerInfo.username;
					player.avatarUrl = p.playerInfo.avatarUrl;
					player.points = p.points;
					player.lastPing = p.lastPing;
					player.afk = p.playerInfo.afk
					player.cardCzar = false;
					player.playedCard = false;



					playersPlayedCards.forEach(function(pl) {
						if(pl.equals(p.playerInfo._id)) {
							player.playedCard = true;
						}
					});


					var idleTime = (new Date().getTime() - p.lastPing.getTime())/1000;

					if (playersInfo.currentCardCzar.equals(p.playerInfo._id)) {
						player.status = 'Card Czar';
						player.cardCzar = true;
					}

					if(p.afk) {
						player.status = 'AFK';
					} else if(idleTime >= config.afktime) {
						player.status = 'AFK';
						updatePlayerAFK(gameSessionId, p.playerInfo._id, true, function(data) {

						});
					} else if(idleTime >= config.idletime) {
						player.status = 'Idle'
					} else {
						player.status = '';
					}


					playersList.push(player);
				}
			});

			callback(playersList);
		}
	});
}

exports.updatePlayerAFK = updatePlayerAFK;
function updatePlayerAFK(gameSessionId,playerId, afk, callback) {

		GameSession.update({ _id: gameSessionId, "players.playerInfo" : playerId },
			{
				$set : { "players.$.afk" : true }
			},
			{upsert:false }, function(err, doc) { 

				if(err) { console.log(err); callback(err);}
				else { 
					GameSession.findOne({ _id: gameSessionId}, { "players.playerInfo" : 1, "currentCardCzar" : 1},
					 function(err, gameInfo) {
						//console.log("AFK Updated: " + doc);

						if(gameInfo.currentCardCzar.equals(playerId)) {
							getNextCardCzar(function() {
								callback('updated');	
							});
						} else {
							callback('updated');
						}

									 	
					 });

				}

		});
	
}

exports.updatePlayerPingTime = function(gameSessionId,playerId,callback) {

		GameSession.update({ _id: gameSessionId, "players.playerInfo" : playerId },
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
								blackCardActive : blackCard._id
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


exports.getCardCzar = getCardCzar
function getCardCzar(sessionId, callback) {

	GameSession.findOne({ _id: sessionId}, { currentCardCzar : 1} ,function(err, czar) {
		callback(czar.currentCardCzar);
	});

}

exports.setCzar = setCzar
function setCzar(callback) {
	GameSession.update({ _id:  gameSessionId},
	{
		$set : { 
					currentCardCzar : req.params.playerId
			   }  
	},		
	{upsert:false }, function(err, doc) { 
			if(err) { 
				console.log(err); 
				callback(err);			
			}
			else { 
				console.log("New Czar: " + doc);
				callback('updated');
			}

		});
}

exports.getNextCardCzar = getNextCardCzar;
function getNextCardCzar(callback) {
	GameSession.findOne({ _id: gameSessionId},
	{ "players.playerInfo" : 1, "players.points" : 1, "players.afk" : 1, 
	  "players.lastPing" : 1, "currentCardCzar" : 1, "players.connected" : 1
	},
	function(err, gameInfo) {
		//console.log(gameInfo);
		var czarIndex = -1
			for(var i = 0; i < gameInfo.players.length; i++) {
			   if(gameInfo.players[i].playerInfo.equals(gameInfo.currentCardCzar)) {
			     czarIndex = i;
			   }
			}
		//console.log("Current Card Czar: " + czarIndex);
		
		var previousCardCzar = gameInfo.currentCardCzar;

		if(czarIndex + 1 >= gameInfo.players.length) 
		{ czarIndex = 0 } 
		else {
			czarIndex++;
		}

		var nextCardCzarId = gameInfo.players[czarIndex].playerInfo;
		var numOfPlayers = gameInfo.players.length;
		var counter1 = 0;

		while((gameInfo.players[czarIndex].afk === true) && (gameInfo.players[czarIndex].connected === false) && 
			  (counter1 <= numOfPlayers) && (counter1 < 20)) {
			//console.log("Finding new card czar");
			//console.log("counter1: " + counter1 + " || numOfPlayers: " + numOfPlayers);
			if(czarIndex + 1 >= gameInfo.players.length) { 
				czarIndex = 0 
				counter1++;
			} else {
				czarIndex++;
				counter1++;
			}
		} 

		GameSession.update({ _id:  gameSessionId},
		{
			$set : { 
						previousCardCzar : previousCardCzar,
						currentCardCzar : gameInfo.players[czarIndex].playerInfo
				   }  
		},
		{upsert:false }, function(err, doc) { 
			if(err) { 
				console.log(err); 
				callback(err);
			}
			else { 
				console.log("New Czar: " + doc);

					callback('updated');

			}

		});

		//callback(gameInfo.players[czarIndex].playerInfo);
		
	});
}

exports.resetPlayers = resetPlayers;
function resetPlayers(callback) {

	GameSession.update({_id: config.gameSessionId}, { $set : { players : [] }}, function(err, doc) {
		callback(doc);
	});

}

exports.playersCount = playersCount;
function playersCount(gameSessionId, callback) {
	async.series({
		totalPlayers: function(callback) {
			GameSession.aggregate( [
        		{ $unwind: '$players' },
        		{ $group : { _id : {  }, 
        			count : { $sum : 1 }}},
    		], function(err, doc) {

    			callback(null, doc);
    		});			
		},
		totalConnected: function(callback) {
			GameSession.aggregate( [
        		{ $unwind: '$players' },
        		{ $group : { _id : { connected : '$players.connected' }, 
        			count : { $sum : 1 }}},
        		{ $match : { '_id.connected' : true } }
    		], function(err, doc) {

    			callback(null, doc);
    		});				
		},
		totalAvailable: function(callback) {
			GameSession.aggregate( [
        		{ $unwind: '$players' },
        		{ $group : { _id : { afk : '$players.afk', connected: '$players.connected' }, 
        			count : { $sum : 1 }}},
        		{ $match : { '_id.afk' : false, '_id.connected' : true  } }
    		], function(err, doc) {

    			callback(null, doc);
    		});				
		}

	},
	function(err, results) {
		if(err)
		{
			console.log(err);
		} else {
			//console.log(results);
			callback(results);
		}

	});


}


function idInArray(array, id) {
	array.some(function(e){ 
  		return e == id; 
	}) 
}