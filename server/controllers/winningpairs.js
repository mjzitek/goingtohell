var async = require("async");

var mongoose = require('mongoose'),
	WinningPair = mongoose.model('winningpairs')

var config = require('../../config/config');

exports.add = add;
function add(gameSessionId, playerId, blackCardId, whiteCardId, callback) {
	var pair = new WinningPair({
									session: 	gameSessionId,
									player:     playerId,
									blackcard:  blackCardId,
									whitecard:  whiteCardId 
	});

	pair.save(function(err) {
		if(err) {
			callback(err);
		} else {
			callback(pair._id);
		}
	});
}