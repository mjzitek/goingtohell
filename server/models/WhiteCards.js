var mongoose = require('mongoose'),
    Schema = mongoose.Schema



var WhiteCardSchema = new mongoose.Schema({
	text:         String,
	deck:     { type: Schema.Types.ObjectId, ref: 'carddeck' },
	createdate : Date,
	createdby  : { type: Schema.Types.ObjectId, ref: 'users' },
	active:    { type: Boolean, default: true },
	nsfw:      { type: Boolean, default: false }
});

mongoose.model('whitecards', WhiteCardSchema);