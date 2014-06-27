var async = require("async");
var _ = require("underscore");
var moment = require("moment");

var timeHelper = require("../helpers/time.js");

var mongoose = require('mongoose'),
	Users = mongoose.model('users'),
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
	 { "players.playerInfo" : 1, "players.points" : 1, "players.afk" : 1, "players.lastPing" : 1 })
	 .populate("players.playerInfo", "username avatarUrl").exec(function(err, playersInfo) {
		if(err) {
			callback(err);
		}else {
			var playersList = [];
			//console.log(playersInfo);

		    playersInfo.players.forEach(function(player) {
		    		console.log(player);
		    		console.log(player.playerInfo);
			});

			playersInfo.players.forEach(function(p) {
				var player = {};
				player.id = p.playerInfo._id;
				player.username = p.playerInfo.username;
				player.avatarUrl = p.playerInfo.avatarUrl;
				player.points = p.points;
				player.lastPing = p.lastPing;

				var idleTime = (new Date().getTime() - p.lastPing.getTime())/1000;
				console.log(p.lastPing);
				console.log(new Date);
				console.log(idleTime);
				if(p.afk) {
					player.status = 'AFK';
				} else if(idleTime >= 300) {
					player.status = 'Idle'
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



