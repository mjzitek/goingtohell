var express = require('express');
var http = require('http');
var app = express();
var jade = require('jade');
var passport = require('passport');
var passportSocketIo = require("passport.socketio");
var session = require('express-session')
var connect = require('connect');
var cookie = require('cookie');
var config = require('./config/config');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

app.server      = http.createServer(app);


var fs = require('fs');
//var paths = require('paths');

var MongoStore = require('connect-mongo')(session);

var sessionStore = new MongoStore({
     db: 'sessions',
     clear_interval: 3600
})


var logging = require('./config/logger');
var debuglogger = logging.Logging().get('debug');
var datalogger = logging.Logging().get('data');
var dblogger = logging.Logging().get('db');

///////////////////////
// DB Set up


//var mongoose = require("./core/server/models/db");
var db = mongoose.connect(config.db);

var models_path = __dirname + '/server/models';

var walk = function(path) {
	fs.readdirSync(path).forEach(function(file) {
		var newPath = path + '/' + file;
		var stat = fs.statSync(newPath);
		if(stat.isFile()) {
			if(/(.*)\.(js$|coffee$)/.test(file)) {
				require(newPath);
			}
		} else if (stat.isDirectory) {
			walk(newPath);
		}
	});
}

walk(models_path);


// var models = {
// 	ItemsData: require('./core/server/models/Items'),
// 	InventoryData: require('./core/server/models/Inventory'),
// 	UserData: require('./core/server/models/Users'),
// 	BuildingsData: require('./core/server/models/Buildings'),

// 	modelHelpers: require('./core/server/models/helpers')
// }

// Passport
require('./config/passport')(passport);

/////////////////////////
// Engine

//var engine = require("./engine/engine");



/////////////////////////
// Create an http server

	app.set('views', __dirname + '/server/views');
	app.set('view engine', 'jade');
	app.use(express.static(__dirname + '/client/assests'));
	app.use(bodyParser.urlencoded());
	//app.use(express.cookieParser());
    app.use(session({
        secret: 'secret',
        key: 'express.sid',
        cookie: { maxAge: 24 * 60 * 60 * 1000 },
        store:  sessionStore
    }));
	app.use(passport.initialize());
    app.use(passport.session());

/////////////////////////
// Import the routes
fs.readdirSync('./server/routes').forEach(function(file) {
  if ( file[0] == '.' ) return;
  var routeName = file.substr(0, file.indexOf('.'));
  require('./server/routes/' + routeName)(app, passport);
});

/////////////////////////
// Socket.IO

var io = require('socket.io').listen(app.server, {
	logger: {
		debug: debuglogger.debug,
		info: datalogger.info
	}
});

io.configure('development', function() {
	io.set('log level', 3);
});

io.set('authorization', function (data, accept) {
	console.log(data.headers);

	   if (data.headers.cookie) {
		   data.cookie = cookie.parse(data.headers.cookie)
		   data.cookie = connect.utils.parseSignedCookies(data.cookie, 'secret')
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


io.sockets.on('connection', function(socket) {

	var sessionId = socket.handshake.sessionID,
		session = new connect.middleware.session.Session({ sessionStore: sessionStore }, socket.handshake.session);
 
	console.log('socket: ' + sessionId)
	console.log('user: ' + session.passport.user);

	

	//sendChat('Welcome to Stooge Chat', 'The Stooges are on the line');
	// socket.on('chat', function(data){
	// 	sendChat('You', data.text);
	// });
	socket.on("set_village", function(data) {
		//console.log("IO: Village Set: " + data.id);
		socket.set('village', data.id, function() {

		});
		var sendInventory = function( title, data ) {
			socket.emit('inventory', {
				title: title,
				contents: data
			});
		};

		var sendInfo = function(title, data) {
			socket.emit('info', {
				title: title,
				contents: data
			});
		}

		var inventory = require('./core/server/controllers/inventory');
		var villages = require('./core/server/controllers/villages');

		socket.get('village', function(err, village) {
			setInterval(function() {
				//var randomIndex = Math.floor(Math.random()*catchPhrases.length)
				//sendChat('Stooge', catchPhrases[randomIndex]);
				//console.log("xxxx: " + village);
				inventory.getInventoryByVillage(village, function (items) {
					sendInventory('Inventory', items);
				});


				villages.getVillageInfo(village, function(info) {
					sendInfo('Info', info);
				});
			}, 5000);

			inventory.getInventoryByVillage(village, function (items) {
				//console.log("xxxx: " + village);
				sendInventory('Inventory', items);
			});

			villages.getVillageInfo(village, function(info) {
				sendInfo('Info', info);
			});
		});


	});


});



/////////////////////////
var port = process.env.PORT || config.port;
app.server.listen(port);
console.log('Listening on port ' + port);