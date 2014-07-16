var mongoose = require('mongoose'),
    Schema = mongoose.Schema



var WinningPairsSchema = new mongoose.Schema({
	session :  	{ type: Schema.Types.ObjectId, ref: 'gamesession' },
	player :   	{ type: Schema.Types.ObjectId, ref: 'users' },
	blackcard : { type: Schema.Types.ObjectId, ref: 'blackcards' },
	whitecard : { type: Schema.Types.ObjectId, ref: 'whitecards' }
						
});

mongoose.model('winningpairs', WinningPairsSchema);