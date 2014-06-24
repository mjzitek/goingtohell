var mongoose = require('mongoose'),
    Schema = mongoose.Schema



var DeckCategoriesSchema = new mongoose.Schema({
	name :        String,
	createdate :  Date,
	active: 	  Boolean, 
});

mongoose.model('deckcategories', DeckCategoriesSchema);