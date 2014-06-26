
var config = require('../config/config');
var mongoose = require('mongoose');
var async = require("async");
var argv = require('optimist').argv;




process.env.NODE_ENV = process.env.NODE_ENV || 'development';


var fs = require('fs');
//var paths = require('paths');


var db = mongoose.connect(config.db);

var models_path = __dirname + '/../server/models';

var walk = function(path) {
	fs.readdirSync(path).forEach(function(file) {
		var newPath = path + '/' + file;
		var stat = fs.statSync(newPath);
		if(stat.isFile()) {
			if(/(.*)\.(js$|coffee$)/.test(file)) {
				require(newPath);
			}
		} else if (stat.isDirectory) {
			walk(newPath);
		}
	});
}

walk(models_path);

var mongoose = require('mongoose'),
	BlackCards = mongoose.model('blackcards'),
	WhiteCards = mongoose.model('whitecards'),
	DeckCategory = mongoose.model('deckcategories'),
	CardDecks = mongoose.model('carddeck');

var filename = argv.filename;

var data = fs.readFileSync(filename, 'utf8');
var lines = data.split("\n");
var linesCount = lines.length;
console.log(linesCount);

var cardDeck = argv.deck;
var cardType = argv.type
var cardCategory;

var card = [];

var linesProcessed = 0;
var addedCardsCount = 0;


console.log(cardDeck);
if(linesCount > 0) {
		CardDecks.findOne({ name: cardDeck}, function(err, deck) {

			console.log(deck);

			lines.forEach(function(line) {
				
				card.cardText = line.trim();
				card.cardDeckId = deck._id;
				card.cardType = cardType;

				console.log(card);
				if(card.cardText != "")
				{
					createCard(card, function(doc) {
						linesProcessed++;

						if(doc === "saved") {
							addedCardsCount++;
						}

						if(linesCount === linesProcessed)
						{
								console.log("All lines processed");
								console.log("Total Saved: " + addedCardsCount);
								process.exit(1);
						}
					});
				} else {
					console.log("No lines to process");
					process.exit(1);
				}
			});
	});


}



function createCard(card, callback) {
	
	console.log(card);


	var newCard = null;
	if(card.cardType === "black")
	{
		newCard = new BlackCards({
			text: 		card.cardText,
			deck: 		card.cardDeckId,
			createdate: new Date(),
			createdby: 	"53ab74fa1f55d70e969cda53",
			active: 	true,
		});
	}
	else if(card.cardType === "white")
	{
		newCard = new WhiteCards({
			text: 		card.cardText,
			deck: 		card.cardDeckId,
			createdate: new Date(),
			createdby: 	"53ab74fa1f55d70e969cda53",
			active: 	true,
		});
	}

	if(newCard) {
		newCard.save(function(err) {
			if(!err)
				callback('saved');
		});
	}
}