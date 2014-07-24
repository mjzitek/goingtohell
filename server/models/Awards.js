var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var AwardSchema = new mongoose.Schema({
	title :       String,
	description:  String,
	dateAdded:    Date
});

mongoose.model('awards', AwardSchema);  