var mongoose = require('mongoose'),
    Schema = mongoose.Schema



var CardDeckSchema = new mongoose.Schema({
	name :        String,
	category:     { type: Schema.Types.ObjectId, ref: 'deckcategories' },
	createdate :  Date,
	active: 	  Boolean, 
});

mongoose.model('carddeck', CardDeckSchema);