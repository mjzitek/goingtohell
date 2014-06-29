var mongoose = require('mongoose'),
    Schema = mongoose.Schema



var BlackCardSchema = new mongoose.Schema({
	text:         String,
	deck:     { type: Schema.Types.ObjectId, ref: 'carddecks' },
	createdate :  Date,
	createdby  : { type: Schema.Types.ObjectId, ref: 'users' },
	active:    { type: Boolean, default: true },
	nsfw:      { type: Boolean, default: false }
});

mongoose.model('blackcards', BlackCardSchema);