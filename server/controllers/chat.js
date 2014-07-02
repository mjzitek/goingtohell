var async = require("async");
var _ = require("underscore");
var moment = require("moment");

var timeHelper = require("../helpers/time.js");
var config = require('../../config/config');

var mongoose = require('mongoose'),
	ChatLog = mongoose.model('chatlog');


exports.add = add;
function add(sessionId, messageType, playerId, text, callback) {

	chat = new ChatLog({
							session : sessionId,
							messageType: messageType,
							player : playerId,
							text: text
					  });


	chat.save(function (err) {
			if(err) {
				console.log(err);
				callback(err);
			} else {
				console.log(new Date() + " " + playerId + ": " + text);
    			callback("chat added");				
			}
	});

}

exports.get = get;
function get(sessionId, numOfLines, callback) {

	if(numOfLines === 0) numOfLines = 500;

	ChatLog.find({ session : sessionId }, { _id: 1, player: 1, text: 1, messageType: 1 })
	       .sort( {_id : -1})
	       .limit(numOfLines)
	       .populate("player", "username")
	       .exec(function(err, chat) {

	       				var chatData = [];

						for(i = chat.length-1; i >= 0; i--) {
							var data = {};

							data.type = chat[i].messageType;
							if(chat[i].player)
							{
								data.username = chat[i].player.username;
								data.userid = chat[i].player._id;
							}
							data.message = chat[i].text;

							chatData.push(data);
						}
					callback(chatData);
	});
}