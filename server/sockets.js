/////////////////////////
// Socket.IO

var io = require('socket.io');
var sanitize = require('google-caja').sanitize;
var _ = require("underscore");


// _.mixin({
//   capitalize: function(string) {
//     return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
//   }
// });
// _("fabio").capitalize();

var gamesession = require('./controllers/gamesession');

var players = [];

var timerStarted = false;

exports.initialize = function(server) {
	io = io.listen(server);

	var chatInfa = io.of("/chat_infa")
		.on("connection", function(socket) {
			//console.log(socket);
			socket.send(JSON.stringify(
				{
					type: 'serverMessage',
					message: 'Welcome'
				}
			));

		if(!timerStarted)
		{
			timerStarted = true;
			console.log("Starting timer...");
			setInterval(function() {
				sendPlayerList();
			}, 3000);		
		}
	

		var sendPlayerList = function() {
			console.log("Sending player List");
			gamesession.getPlayerList('53ac67251f55d70e969cda55',function(players) {
				//console.log(players);
				socket.emit("players_list", players);
				socket.broadcast.emit("players_list", players);
			// 	players.forEach(function(player) {
			// 		console.log(player.playerInfo);
			// 	});

			});
		}			

		socket.on("join_room", function(data) {

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



			//socket.emit("players_list", players);
			//socket.broadcast.emit("players_list", players);

			gamesession.addPlayer('53ac67251f55d70e969cda55', data.username, function() {});
		});

		socket.on('disconnect', function(){
			// remove the username from global usernames list
			// console.log(socket.username + " disconnecting");

			// var playerIndex = -1;

		 //    for (var i = 0; i < players.length; i++) {
		 //    	console.log(players[i].username + " => " + username);
		 //        if (players[i].username == socket.username) {
		 //            playerIndex = i;
		 //        }
		 //    }
			// console.log(players);

			// console.log("**** " + i - 1);
			// if(i - 1 >= 0) players.splice(i - 1, 1);

			// // update list of users in chat, client-side
			// socket.emit("players_list", players);
			// socket.broadcast.emit("players_list", players);

			//socket.leave(socket.room);
		});
	});

	var chatCom = io.of("/chat_com")
		.on("connection", function(socket) {
			socket.on('message', function (data) {
				data = JSON.parse(data);
				if(data.message.trim() === "/AFK") {
					console.log("marking " + data.username + " AFK");
					var afk = true;
					gamesession.updatePlayerAFK('53ac67251f55d70e969cda55',data.username, afk,function(doc) {

					});
					data.type = "playerStatus";
					data.message = "is now AFK.";
				} else {
					gamesession.updatePlayerPingTime('53ac67251f55d70e969cda55',data.username, function(doc){});
				}
				var dataMessageOrg = data.message;
				data.message = sanitize(data.message);

				if(dataMessageOrg != data.message) {
					data.message = "<span class='message-error'>** SANITIZED **</span>"
				}
				if(data.type === "playerMessage" || data.type === "playerStatus") {

					socket.broadcast.send(JSON.stringify(data));
					socket.send(JSON.stringify(data));
					//chatInfa.sendPlayerList()

				}
			});
		});

	// io.sockets.on("connection", function(socket) {



	// 		socket.on('message', function(data) {
	// 			data = JSON.parse(data);
	// 			var dataMessageOrg = data.message;
	// 			data.message = sanitize(data.message);

	// 			if(dataMessageOrg != data.message) {
	// 				data.message = "<span class='message-error'>** SANITIZED **</span>"
	// 			}
	// 			if(data.type == "playerMessage") {
	// 				socket.broadcast.send(JSON.stringify(data));
	// 				socket.send(JSON.stringify(data));
	// 			}
	// 		});


	// });


}