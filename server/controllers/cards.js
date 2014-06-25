
var async = require("async");

var mongoose = require('mongoose'),
	BlackCards = mongoose.model('blackcards'),
	WhiteCards = mongoose.model('whitecards');



exports.getBlackCards = function(req, res) {

	// populationCountFiltered(query, function (persCount) {


	// 		var ranNum = (Math.floor(Math.random() * persCount))
	// 		//console.log(ranNum);
	// 		Person.findOne(query, fields).skip(ranNum).limit(1).exec(function(err, per) {
	// 				callback(per);
	// 		});

	// });
	getRandomBlackCard("", function(card) {
		return res.jsonp(card);
	});
				
};

exports.getWhiteCards = function(req, res) {
	
	getRandomWhiteCards(req.params.amt,"", function(cards) {
		return res.jsonp(cards);
	});
}


function getRandomBlackCard(deck, callback) {

	var filter = {};

	if(deck != "") {
		filter.deck = deck;
	}
		BlackCards.count(filter, function(err, cardCount) {
			var randNum = (Math.floor(Math.random() * cardCount));
			BlackCards.findOne(filter).skip(randNum).limit(1).exec(function(err, card) {
					callback(card);
			});

		});


}

exports.getRandomWhiteCards = getRandomWhiteCards;
function getRandomWhiteCards(amount, deck, callback) {

	async.series({
		cards: function(callback) {

			var cards = [];

			var filter = {};

			if(deck != "") {
				filter.deck = deck;
			}

			for(var i = 0; i < amount; i++) {
				WhiteCards.count(filter, function(err, cardCount) {
					var randNum = (Math.floor(Math.random() * cardCount));
					
					WhiteCards.findOne(filter).skip(randNum).limit(1).exec(function(err, card) {
						cards.push(card);
						amount--;

						if(amount == 0)
			{
							callback(null, cards);
						}
					});

				});

			}



		}
	},
	function(err, results) {
		if(err) {
			callback(err);
		} else {
			callback(results);
		}
	});
}
