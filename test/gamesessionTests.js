/* Unit and Intergration tests for persons controller */

var expect = require("chai").expect;
var mongoose = require("mongoose");
var fs = require("fs");


var config = require('../config/config');


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

var gamesession = require('../server/controllers/gamesession');





describe("Game Settings", function () {


	var sessionId;


	describe("create()", function() {
		it("should return a game session id", function(done) {
			gamesession.create(function(gid) {
				sessionId = gid;
				expect(gid).to.not.be.empty;
				done();
			});
		});
	});

	describe("remove()", function() {
		it("should return 'removed'", function(done) {
			gamesession.remove(sessionId, function(doc) {
				expect(doc).to.equal("removed");
				done();
			});
		});
	});	

});