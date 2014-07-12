var auth = require('./middlewares/authorization');

var admin = require('../controllers/admin');


module.exports = function(app, models) {
  app.get('/admin/usereditor/:username', auth.isLoggedIn, auth.needsGroup("admins"), admin.useredit);
  app.get('/admin/user/activate/:userid', auth.isLoggedIn, auth.needsGroup("admins"), admin.activateuser);
  app.post('/admin/resetplayers', auth.isLoggedIn, auth.needsGroup("admins"), admin.resetplayers);
}