var mongoose = require('mongoose'),
    Schema = mongoose.Schema



var GameSessionSchema = new mongoose.Schema({
		sessionName:    String,
		players:        [
							playerInfo:   { type: Schema.Types.ObjectId, ref: 'users' },
							points:       Number,
							whitecards:   [{ type: Schema.Types.ObjectId, ref: 'whitecards' }]
						],
		decks:          [{ type: Schema.Types.ObjectId, ref: 'carddecks' }],
		cardsplayed:    {
							blackcards : [{ type: Schema.Types.ObjectId, ref: 'blackcards' }],
							whitecards:   [{ type: Schema.Types.ObjectId, ref: 'whitecards' }]
						},
		cardsactive:    {
							blackcard: { type: Schema.Types.ObjectId, ref: 'blackcards' },
							whitecards: [
											{
												playerInfo:   { type: Schema.Types.ObjectId, ref: 'users' },
												whitecard:    { type: Schema.Types.ObjectId, ref: 'whitecards' }
											}
										]
						}
});

mongoose.model('gamesession', GameSessionSchema);