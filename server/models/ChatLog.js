var mongoose = require('mongoose'),
    Schema = mongoose.Schema



var ChatLogSchema = new mongoose.Schema({
	user :       { type: Schema.Types.ObjectId, ref: 'users' },
	timestamp :  Date,
	text :       String,
	roomId:      { type: Schema.Types.ObjectId, ref: 'rooms' }
});

mongoose.model('chatlog', ChatLogSchema);  