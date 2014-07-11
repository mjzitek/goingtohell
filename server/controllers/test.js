



exports.socketTest = function(socket) {
	
	console.log(socket);

	//socket_io.on('connection', function(socket) {
		socket.broadcast.emit('test', 'Hello World!');
	//});
}