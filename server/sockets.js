/////////////////////////
// Socket.IO

var io = require('socket.io');
var sanitize = require('google-caja').sanitize;
var _ = require("underscore");
var cookie = require('cookie');
var connect = require('connect');

// _.mixin({
//   capitalize: function(string) {
//     return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
//   }
// });
// _("fabio").capitalize();

var mongoose = require('mongoose'),
	Users = mongoose.model('users');

var config = require('../config/config');

var gamesession = require('./controllers/gamesession'),
	user = require('./controllers/users'),
    chatLog = require('./controllers/chat');




var players = {};


var timerStarted = false;

exports.initialize = function(server, sessionStore) {


	io = io.listen(server);
	io.set('log level', 2);

	io.set('authorization', function (data, accept) {
	//console.log(data.headers);

	   if (data.headers.cookie) {
		   data.cookie = cookie.parse(data.headers.cookie)
		   data.cookie = connect.utils.parseSignedCookies(data.cookie, config.sessionSecret)
		   data.cookie = connect.utils.parseJSONCookies(data.cookie)
		   data.sessionID = data.cookie['express.sid']
		   sessionStore.load(data.sessionID, function (err, session) {
			   if (err || !session) {
				   // invalid session idendtifier. tl;dr gtfo.
				   accept('session error', false)
			   } else {
				   data.session = session
				   accept(null, true)
			   }
		   })
 
	   } else {
			// no auth cookie...
		   //accept('session error', false)
		   console.log('**** IO session error'.red);
	   }

}); 

///////////////////////////////////////////////////////////////////////////////////////////////
// 
//  chatInfa

	var chatInfa = io.of("/chat_infa")
		.on("connection", function(socket) {

		if(!timerStarted)
		{
			timerStarted = true;
			console.log("Starting timer...");
			setInterval(function() {
				sendPlayerList();
			}, 3000);		
		}
	
		//testTest(socket);

		var sendPlayerList = function() {
			//console.log("Sending player List");
			gamesession.getPlayerList(config.gameSessionId,function(playersList) {
				//console.log(players);
				//console.log(players.length);
				socket.emit("players_list", playersList);
				socket.broadcast.emit("players_list", playersList);
			});
		}	



		socket.on("join_room", function(data) {
			console.log(data);

			socket.user = data;
			console.log(socket.user.username + " connected");
			console.log(socket.id);



			players[data.username] = {
				"socket" : socket.id,
				"userid" : data.userid,
				"username" : data.username,
				"connectTime" : new Date(),
				"room" : null
			}


			console.log(data);

			var d = {}
			d.type = "serverMessage";
			d.message = socket.user.username + " has joined";

			chatLog.add(config.sessionId, "serverMessage", null,  d.message, function(doc) {});

			d = JSON.stringify(d);

			socket.emit("message", d);
			socket.broadcast.emit("message", d);

			gamesession.addPlayer(config.gameSessionId, data.username, function() {
			});
			gamesession.updatePlayerPingTime(config.gameSessionId,data.userid, function(doc) {
				var playersCount = {};
				gamesession.playersCount(config.gameSessionId, function(p) {
					playersCount.all = (p.totalPlayers[0] ? p.totalPlayers[0].count : 0);
					playersCount.connected = (p.totalConnected[0] ? p.totalConnected[0].count : 0);
					playersCount.available = (p.totalAvailable[0] ? p.totalAvailable[0].count : 0);
					console.log(playersCount);

					// Assume no one was connected and someone just connected
					if(playersCount.connected === 1) {
						// Assign CZAR to person who is connected
						//gamesession.getNextCardCzar(function() {
							gamesession.newRound(config.gameSessionId, function() {});
						//});
					}


				});

			});

			// Check czar
			// - If current czar is AFK and you join the room, and no one else is in the room
			//   or you join the room and you are the only one there
			//   make you current czar



		});

	//  Disconnected
		socket.on('disconnect', function(){

			gamesession.updatePlayerRoomStatus(config.gameSessionId, socket.user.userid, false, function(){});

			var d = {}
			d.type = "serverMessage";
			d.message = socket.user.username + " has left";

			chatLog.add(config.sessionId, "serverMessage", null,  d.message, function(doc) {});

			d = JSON.stringify(d);

			socket.emit("message", d);
			socket.broadcast.emit("message", d);

			socket.emit("player_disconnected", socket.user.userid);

			for(var name in players) {

				if(players[socket.user.username])
				{
	  				if(players[socket.user.username].socket === socket.id) {
	  					delete players[socket.user.username];
	  				}
	  			}
  			}

  			// Check to see if player was czar, and if so, reassign
			var playersCount = {};
			gamesession.playersCount(config.gameSessionId, function(p) {
				playersCount.all = (p.totalPlayers[0] ? p.totalPlayers[0].count : 0);
				playersCount.connected = (p.totalConnected[0] ? p.totalConnected[0].count : 0);
				playersCount.available = (p.totalAvailable[0] ? p.totalAvailable[0].count : 0);
				console.log(playersCount);

			});  		

			gamesession.getCardCzar(config.gameSessionId, function(czar) {
				if(czar.equals(socket.user.userid)) {
					gamesession.getNextCardCzar(function() {
						gamesession.newRound(config.gameSessionId, function() {
							sendNewRound();
						});
					});
				};
			});

			var sendNewRound = function() {
					socket.emit("new_round", null);
					//socket.broadcast.emit("new_round", null);				
			}

			console.log(socket.user.username + " disconnected");
		});
	});

	//var testTest = function(socket) {test.socketTest(socket); console.log("testTest");}

///////////////////////////////////////////////////////////////////////////////////////////////
// 
//  gameInfa

	var gameInfaTimerStarted = false;

	var gameInfa = io.of("/game_infa")
		.on("connection", function(socket){


		var sendServerNotfication = function(message, playerId, broadcast) {

			if(broadcast) {
				socekt.emit("server_notification", message)
				socket.broadcast.emit("server_notification", message);
			}

			if(playerId) {
				for(var name in players)
				{					

					playersUserId = mongoose.Types.ObjectId(players[name].userid);
					playerId = mongoose.Types.ObjectId(playerId);

					if(playersUserId.equals(playerId))
					{
						console.log(players[name]);

						gameInfa.socket(players[name].socket).emit("server_notification", message);						
					}
				}

			}
		}


			socket.on("get_cards", function(data) {
				console.log("Received request for cards");
				sendActiveCards();
			});

			socket.on("winning_card", function(data) {
				console.log("Winning card selected");
				data = JSON.parse(data);
				gamesession.winningCard(data, 
					function() {});

				var message = {}
				message.text = "You won!!!!";

				sendServerNotfication(message, data.winningPlayerId ,false);
				sendWinningCardNotfication(data, function() {});
			});

			if(!gameInfaTimerStarted)
			{
				gameInfaTimerStarted = true;
				console.log("Starting timer...");
				setInterval(function() {
					sendActiveCards();
				}, 5000);		
			}

			var sendActiveCards = function() {
				//console.log("Sending active cards");
				gamesession.getActiveCards(config.gameSessionId, function(cards) {
					socket.emit("cards_list", cards);
					socket.broadcast.emit("cards_list", cards);
				})
			}	

			var sendWinningCardNotfication = function(data, callback) {

				user.getUserById(data.winningPlayerId, function(u) {
					chatLog.add(config.sessionId, "winnerNotfication", null,  u.username, function(doc) {});

					var data = {};

					data.type = 'winnerNotfication';
					data.username = u.username;

					socket.emit("winner_notfication", JSON.stringify(data));
					socket.broadcast.emit("winner_notfication", JSON.stringify(data));
					
					sendNewRound();
				});
			}	


			var sendNewRound = function() {
					socket.emit("new_round", null);
					socket.broadcast.emit("new_round", null);				
			}



			sendActiveCards();


	});

///////////////////////////////////////////////////////////////////////////////////////////////
// 
//  chatCom

	var chatCom = io.of("/chat_com")
		.on("connection", function(socket) {


			var sendLatestChat = function(sessionId) {
					chatLog.get(sessionId, 10, function(data) {

						socket.emit("chat_log", JSON.stringify(data));
					});
			}

			sendLatestChat(config.sessionId);


			socket.on('message', function (data) {
				data = JSON.parse(data);
				//console.log(data);
				if(data.message.trim() === "/AFK") {
					console.log("marking " + data.username + " AFK");
					var afk = true;
					gamesession.updatePlayerAFK(config.gameSessionId,data.userid, afk,function(doc) {

					});
					data.type = "playerStatus";
					data.message = "is now AFK.";
				} else {
					gamesession.updatePlayerPingTime(config.gameSessionId,data.userid, function(doc){});
				}
				var dataMessageOrg = data.message;
				data.message = sanitize(data.message);

				if(dataMessageOrg != data.message) {
					console.log("** Chat was sanitized: " + dataMessageOrg);
					data.message = "<span class='message-error'>** SANITIZED **</span>"
				}

				chatLog.add(config.sessionId, data.type, data.userid, data.message, function(doc) {});


				if(data.type === "playerMessage" || data.type === "playerStatus") {

					socket.broadcast.send(JSON.stringify(data));
					socket.send(JSON.stringify(data));
					//chatInfa.sendPlayerList()

				}
			});



		});




}