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
var favicon = require('serve-favicon');
var busboy = require('connect-busboy');
var gm = require('gm');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

app.server      = http.createServer(app);


config.baseFolder = __dirname;


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

var db = mongoose.connect(config.db);
db.autoReconnect = true

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

/////////////////////////
// Passport
require('./config/passport')(passport);

/////////////////////////
// Create an http server

	app.set('views', __dirname + '/client/views');
	app.set('view engine', 'jade');

	app.use("/avatars", express.static(__dirname  + config.uploadFolder + '/avatars'));	
	app.use(express.static(__dirname + '/client/assests'));

	app.use(favicon(__dirname + '/client/assests/favicon.ico'));
	app.use(bodyParser.urlencoded());
	app.use(bodyParser.json())
	//app.use(express.cookieParser());
    app.use(session({
        secret: config.sessionSecret,
        key: 'express.sid',
        cookie: { maxAge: 24 * 60 * 60 * 1000 },
        store:  sessionStore
    }));
	app.use(passport.initialize());
    app.use(passport.session());
	app.use(busboy());

/////////////////////////
// Import the routes
fs.readdirSync('./client/routes').forEach(function(file) {
  if ( file[0] == '.' ) return;
  var routeName = file.substr(0, file.indexOf('.'));
  require('./client/routes/' + routeName)(app, passport);
});

/////////////////////////
var io = require('./server/sockets');
io.initialize(app.server, sessionStore);

/////////////////////////
var port = process.env.PORT || config.port;
app.server.listen(port);
console.log('Listening on port ' + port);