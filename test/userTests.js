var expect = require("chai").expect;
var mongoose = require("mongoose");
var fs = require("fs");


var config = require('../config/config');

require('../server/models/Users');

var mockgoose = require('mockgoose');
mockgoose(mongoose);

var User = mongoose.model('users'),
    ObjectId = mongoose.Types.ObjectId();


var user = require('../server/controllers/users');


describe("Users", function() {

	beforeEach(function(done) {
		mockgoose.reset();
		User.create( {
			_id: ObjectId,
			name: 'T Tester',
			email: 'tester@tester.com',
			username: 'tester',
			password: 'password',
			active: false
		}, function(err, model) {
			done(err);
		});
	});

	afterEach(function(done) {
		mockgoose.reset();
		done();
	});

	describe('#getUserByName()', function () {
		it("should return tester", function(done) {
			user.getUserByName("tester",function(user) {
				expect(user.username).to.equal("tester");
				done();
			});
		});
	});

	describe('#getUserById()', function() {
		it("should return 'tester'", function(done) {
			user.getUserById(ObjectId, function(user) {
				expect(user.username).to.equal("tester");
				done();
			});
		});
	});

	describe('#activateUser()', function() {
		it("should return 'true'", function(done) {
			user.activateUser(ObjectId, function(user) {
				expect(user.active).to.equal(true);
				done();
			})
		});
	})

});
