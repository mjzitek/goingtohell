var mongoose = require('mongoose'),
    Schema = mongoose.Schema



var BlackCardSchema = new mongoose.Schema({
	text:         String,
	deck:     { type: Schema.Types.ObjectId, ref: 'carddeck' },
	createdate :  Date,
	createdby  : { type: Schema.Types.ObjectId, ref: 'users' },
	active: 	  Boolean
});

mongoose.model('blackcards', BlackCardSchema);