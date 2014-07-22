var auth = require('./middlewares/authorization');

var index = require('../controllers/index');

module.exports = function(app, models) {
	app.get('/', auth.isLoggedIn, index.getIndex);
	
	app.get('/leaderboard', auth.isLoggedIn, index.getLeaderboard);

	app.post('/setczar/:playerId', auth.isLoggedIn, auth.needsGroup("admins"), index.setCzar);

}

