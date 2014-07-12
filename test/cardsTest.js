var expect = require("chai").expect;
var mongoose = require("mongoose");
var fs = require("fs");


var config = require('../config/config');

require('../server/models/BlackCards');
require('../server/models/WhiteCards');
require('../server/models/GameSession');

var mockgoose = require('mockgoose');
mockgoose(mongoose);

var BlackCard = mongoose.model('blackcards'),
    WhiteCard = mongoose.model('whitecards'),
    ObjectId = mongoose.Types.ObjectId();


var cards = require('../server/controllers/cards');


describe.only("Cards", function() {


	beforeEach(function(done) {
		mockgoose.reset();
		BlackCard.create( {
			_id: ObjectId,
			text: 'This is a test black card (#1)',
			deck: ObjectId,
			createdate: new Date(),
			createdby: ObjectId,
			active: true,
			nsfw: false
		}, function(err, model) {
			done(err);
		});
	});

	afterEach(function(done) {
		mockgoose.reset();
		done();
	});


	describe('#getRandomBlackCard()', function () {
		it("should return a card", function(done) {
			cards.getRandomBlackCard("",function(card) {
				console.log(ObjectId);
				console.log(card);
				expect(card.text).to.equal("This is a test black card (#1)");
				done();
			});
		});
	});
});
