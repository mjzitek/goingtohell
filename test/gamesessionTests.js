var expect = require("chai").expect;
var mongoose = require("mongoose");
var fs = require("fs");


var config = require('../config/config');

require('../server/models/GameSession');
require('../server/models/Users');

var mockgoose = require('mockgoose');
mockgoose(mongoose);

var GameSession = mongoose.model('gamesession'),
	User = mongoose.model('users'),
    ObjectId = mongoose.Types.ObjectId();


var gamesession = require('../server/controllers/gamesession');

var gameSessionId = mongoose.Types.ObjectId();
var playerId = mongoose.Types.ObjectId();

var newGameSessionId;
var newPlayerId = mongoose.Types.ObjectId();

describe("Game Session", function () {

	before(function(done) {
		mockgoose.reset();
		GameSession.create( {
			_id: gameSessionId,
			sessionName: 'Test',
			players: [
						{
							playerInfo: playerId,
							points: 5,
							whitecards: [
								mongoose.Types.ObjectId()
							],
							afk: false,
							lastPing: new Date(),
							connected: false
						}
					 ],
			roundsPlayed: 5,
			nsfwMode: true,
			currentCardCzar: mongoose.Types.ObjectId(),
			previousCardCzar: mongoose.Types.ObjectId(),
			decks:  [
						mongoose.Types.ObjectId()
					],
			blackCardsPlayed: [
									mongoose.Types.ObjectId()
							  ],
			whiteCardsPlayed: [
									mongoose.Types.ObjectId()
							  ],
			blackCardActive:  [
									mongoose.Types.ObjectId()
							  ],
			whiteCardsActive: [
									{
										playerInfo: mongoose.Types.ObjectId(),
										whitecard: mongoose.Types.ObjectId()
									}
							  ]
		}, function(err, model) {

		});

		User.create( {
			_id: playerId,
			name: 'm Tester',
			email: 'mtester@tester.com',
			username: 'mtester',
			password: 'password',
			active: true
		}, function(err, model) {

		});

		User.create( {
			_id: newPlayerId,
			name: 'T Tester',
			email: 'tester@tester.com',
			username: 'tester',
			password: 'password',
			active: true
		}, function(err, model) {
			done(err);
		});
	});

	after(function(done) {
		mockgoose.reset();
		done();
	});

	describe("#create()", function() {
		it("should return an ObjectId", function(done) {
			gamesession.create(function(doc) {
				newGameSessionId = doc;
				// Need to change this...even if error occurs something is returned
				// Should return the ObjectId of new game session

				expect(doc).to.not.be.empty;
				done();
			});
		});
	});



	describe("#addPlayer()", function() {
		it("should return 1", function(done) {
			gamesession.addPlayer(gameSessionId, 'tester', function(doc) {
				expect(doc).to.equal(1);
				done();
			});
		});
	});





	describe("#updatePlayerRoomStatus()", function() {
		it("should return 1", function(done) {
			gamesession.updatePlayerRoomStatus(gameSessionId, newPlayerId, true, function(doc) {
				expect(doc).to.equal(1);
				done();
			});
		});
	});

	describe("#get()", function() {
		it("should return a game session", function(done) {
			gamesession.get(gameSessionId, function(game) {
				//console.log(game);
				expect(game._id).to.not.be.empty;
				done();
			});
		});
	});

	// describe("#getPlayerList()", function() {
	// 	it("should not be empty", function(done) {
	// 		gamesession.getPlayerList(gameSessionId, function(players) {
	// 			console.log(players);
	// 			expect(players).to.be.empty;
	// 			done();
	// 		})
	// 	});
	// })

	describe("#updatePlayerAFK()", function() {
		it("should return 'updated", function(done) {
			gamesession.updatePlayerAFK(gameSessionId, playerId, true, function(doc) {
				expect(doc).to.equal('updated');
				done();
			})
		});
	})

	describe("#remove()", function() {
		it("should return 'removed'", function(done) {
			gamesession.remove(newGameSessionId, function(doc) {
				expect(doc).to.equal('removed');
				done();
			});
		});
	});



});