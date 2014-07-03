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
    chat = require('./controllers/chat');




var players = [];


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
				   // invalid session identifier. tl;dr gtfo.
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

	var chatInfa = io.of("/chat_infa")
		.on("connection", function(socket) {

			
			//console.log(socket);
			// socket.send(JSON.stringify(
			// 	{
			// 		type: 'serverMessage',
			// 		message: 'Welcome'
			// 	}
			// ));



		if(!timerStarted)
		{
			timerStarted = true;
			console.log("Starting timer...");
			setInterval(function() {
				sendPlayerList();
			}, 3000);		
		}
	

		var sendPlayerList = function() {
			//console.log("Sending player List");
			gamesession.getPlayerList(config.gameSessionId,function(players) {
				//console.log(players);
				socket.emit("players_list", players);
				socket.broadcast.emit("players_list", players);
			// 	players.forEach(function(player) {
			// 		console.log(player.playerInfo);
			// 	});

			});
		}	

		socket.on("join_room", function(data) {
			console.log(data);

			socket.user = data;
			console.log(socket.user.username + " connected");
			var found = false;
			players.forEach(function(player) {
				if(player.username === data.username)
				{
					found = true;
				}
			});

			if(!found) {
				players.push(data);
				socket.username = data.username;
			}

			var d = {}
			d.type = "serverMessage";
			d.message = socket.user.username + " has joined";

			chat.add(config.sessionId, "serverMessage", null,  d.message, function(doc) {});

			d = JSON.stringify(d);

			socket.emit("message", d);
			socket.broadcast.emit("message", d);

			//socket.emit("players_list", players);
			//socket.broadcast.emit("players_list", players);

			gamesession.addPlayer(config.gameSessionId, data.username, function() {});
		});

				// when the user disconnects.. perform this
		socket.on('disconnect', function(){

			gamesession.updatePlayerRoomStatus(config.gameSessionId, socket.user.userid, false, function(){});

			var d = {}
			d.type = "serverMessage";
			d.message = socket.user.username + " has left";

			chat.add(config.sessionId, "serverMessage", null,  d.message, function(doc) {});

			d = JSON.stringify(d);

			socket.emit("message", d);
			socket.broadcast.emit("message", d);


			console.log(socket.user.username + " disconnected");
		});
	});

	var gameInfaTimerStarted = false;

	var gameInfa = io.of("/game_infa")
		.on("connection", function(socket){



			socket.on("get_cards", function(data) {
				console.log("Received request for cards");
				sendActiveCards();
			});

			socket.on("winning_card", function(data) {
				console.log("Winning card selected");
				data = JSON.parse(data);
				gamesession.winningCard(data, 
					function() {});
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

				Users.find({ _id : data.winningPlayerId }, { username : 1}, function(err, user) {
					chat.add(config.sessionId, "winnerNotfication", null,  user[0].username, function(doc) {});

					var data = {};

					data.type = 'winnerNotfication';
					data.username = user[0].username;



					socket.emit("winner_notfication", JSON.stringify(data));
					socket.broadcast.emit("winner_notfication", JSON.stringify(data));
					callback(data);
				});

			}	



			sendActiveCards();



	});


	var chatCom = io.of("/chat_com")
		.on("connection", function(socket) {


			var sendLatestChat = function(sessionId) {
					chat.get(sessionId, 10, function(data) {



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
					data.message = "<span class='message-error'>** SANITIZED **</span>"
				}

				chat.add(config.sessionId, data.type, data.userid, data.message, function(doc) {});


				if(data.type === "playerMessage" || data.type === "playerStatus") {

					socket.broadcast.send(JSON.stringify(data));
					socket.send(JSON.stringify(data));
					//chatInfa.sendPlayerList()

				}
			});



		});




}