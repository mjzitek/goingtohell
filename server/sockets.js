/////////////////////////
// Socket.IO

var io = require('socket.io');
var sanitize = require('google-caja').sanitize;

exports.initialize = function(server) {
	io = io.listen(server);

	var chatInfa = io.of("/chat_infa")
		.on("connection", function(socket) {
			socket.send(JSON.stringify(
				{
					type: 'serverMessage',
					message: 'Welcome'
				}
			));

			var players = [];
			players.push({ username: "zblu64", id: "AAAAAA" })

			socket.emit("players_list", players);
			socket.broadcast.emit("players_list", players);

		});


	var chatCom = io.of("/chat_com")
		.on("connection", function(socket) {
			socket.on('message', function (data) {
				data = JSON.parse(data);
				var dataMessageOrg = data.message;
				data.message = sanitize(data.message);

				if(dataMessageOrg != data.message) {
					data.message = "<span class='message-error'>** SANITIZED **</span>"
				}
				if(data.type == "playerMessage") {
					socket.broadcast.send(JSON.stringify(data));
					socket.send(JSON.stringify(data));
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