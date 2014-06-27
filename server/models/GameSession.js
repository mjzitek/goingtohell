var mongoose = require('mongoose'),
    Schema = mongoose.Schema



var GameSessionSchema = new mongoose.Schema({
		sessionName :      String,
		players :          [
								{
									playerInfo:   { type: Schema.Types.ObjectId, ref: 'users' },
									points:       Number,
									whitecards:   [{ type: Schema.Types.ObjectId, ref: 'whitecards' }],
									afk: 		  { type: Boolean, default: false},
									lastPing:     Date 
								}
						   ],
		currentCardCzar : { type: Schema.Types.ObjectId, ref: 'users' },
		previousCardCzar: { type: Schema.Types.ObjectId, ref: 'users' },
		decks :            [ { type: Schema.Types.ObjectId, ref: 'carddecks' }],
		blackCardsPlayed : [ { type: Schema.Types.ObjectId, ref: 'blackcards' }],
		whiteCardsPlayed : [ { type: Schema.Types.ObjectId, ref: 'whitecards' }],
		blackCardActive  : { type: Schema.Types.ObjectId, ref: 'blackcards' },
		whiteCardsActive : [
								{
									playerInfo:   { type: Schema.Types.ObjectId, ref: 'users' },
									whitecard:    { type: Schema.Types.ObjectId, ref: 'whitecards' }
								}
						   ]
						
});

mongoose.model('gamesession', GameSessionSchema);