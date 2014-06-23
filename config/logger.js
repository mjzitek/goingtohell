/*
      From: http://www.snyders.co.uk/2013/04/11/async-logging-in-node-js-just-chill-winston/

*/

var winston = require('winston');
require('winston-mongodb').MongoDB;

var customLevels = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  },
  colors: {
    debug: 'blue',
    info: 'green',
    warn: 'yellow',
    error: 'red'
  }
};

// winston.add(winston.transports.Console, {
//   level: 'warn',
//   prettyPrint: true,
//   colorize: true,
//   silent: false,
//   timestamp: false
// });


// create the main logger
var debuglogger = new(winston.Logger)({
    level: 'debug',
    levels: customLevels.levels,
    transports: [
        // setup console logging
        new(winston.transports.Console)({
            level: 'info',
            levels: customLevels.levels,
            colorize: true
        }),
        // setup logging to file
        new(winston.transports.File)({
            filename: './logs/debug.log',
            maxsize: 1024 * 1024 * 10, // 10MB
            level: 'debug',
            levels: customLevels.levels
        })
    ]
});

// create the data logger - I only log specific app output data here
var datalogger = new (winston.Logger) ({
    level: 'info',
    transports: [
        new (winston.transports.File) ({
            filename:  './logs/data.log',
            maxsize: 1024 * 1024 * 10 // 10MB
        }),
        new (winston.transports.MongoDB) ({
            db: 'villagelog2',
            collection: 'logtest'
        })        
    ]
});

var dblogger = new (winston.Logger) ({
    level: 'info',
    transports: [
        new (winston.transports.MongoDB) ({
            db: 'villagelog',
            collection: 'logtest'
        })
    ]
});



// make winston aware of your awesome colour choices
winston.addColors(customLevels.colors);

var Logging = function() {
    var loggers = {};

    // always return the singleton instance, if it has been initialised once already.
    if (Logging.prototype._singletonInstance) {
        return Logging.prototype._singletonInstance;
    }

    this.getLogger = function(name) {
        return loggers[name];
    }

    this.get = this.getLogger;

    loggers['debug'] = debuglogger;
    loggers['data'] = datalogger;
    loggers['db'] = dblogger;

    Logging.prototype._singletonInstance = this;
};

new Logging(); // I decided to force instantiation of the singleton logger here

debuglogger.debug('Debug Logging set up OK!');
datalogger.info('Data Logging set up OK!');
//dblogger.info('Database Logging set up OK!');



exports.Logging = Logging;