var mongoose = require('mongoose'),
    Schema = mongoose.Schema



var ChatLogSchema = new mongoose.Schema({
	session : { type: Schema.Types.ObjectId, ref: 'gamesession' },
	player :       { type: Schema.Types.ObjectId, ref: 'users' },
	messageType: String,
	timestamp :  { type: Date, default: new Date() },
	text :       String
});

mongoose.model('chatlog', ChatLogSchema);  