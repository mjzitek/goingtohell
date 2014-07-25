var mongoose = require('mongoose'),
	User = mongoose.model('users');

var gm = require('gm');
var fs = require('fs');

var config = require('../../config/config');

exports.create = create;
function create(userInfo, callback) {

	var msg = {};

	var user = new User(userInfo);
	
	user.provider = 'local';

	if(userInfo.tempFilename) {
		user.avatarUrl = '/avatars/' + user._id + '/thumb.png';
	}

	user.save(function(err) {
		if (err) {
			switch (err.code) {
				case 11000:
				case 11001:
					msg.msgClass="alert alert-danger"			// need to move this to /client/ code
					msg.message = 'Username already exists';
					break;
				default:
					msg.msgClass="alert alert-warning"
					msg.message = 'Please fill all the required fields';
			}

			callback(false, user, msg)

		}

		if(userInfo.tempFilename) {
			saveAvatar(userInfo.tempFilename, user._id);			
		}


		callback(true,user, msg);
	
	});
}


exports.getUserById = getUserById;
function getUserById(id, callback) {
	User.findOne({_id:id}, { username: 1, name: 1, email : 1, groups: 1, active: 1, avatarUrl: 1  }, function(err,u) {
			callback(u);
	});

};		

exports.getUserByName = getUserByName;
function getUserByName(username, callback) {
	User.findOne({username: username }, { username: 1, name: 1, email: 1, _id: 1, groups: 1, active: 1 }, 
	  function(err,user) {
		//console.log(user);
		callback(user);
	});
};

exports.activateUser = activateUser;
function activateUser(playerId, callback) {
	User.update({_id: playerId }, { active : true}, function(err, doc) {
		User.findOne({_id: playerId }, { username: 1, name: 1, email: 1, _id: 1, groups: 1, active: 1 }, 
		  function(err,user) {
		  	callback(user);

		});
	})
}

/**
 * Saves the given picture into sized avatars
 *
 * @param  {String} filename
 * @param  {ObjectId} userId
 * @return {bool}
 */
exports.saveAvatar = saveAvatar;
function saveAvatar(filename, userId) {
	try{

   		var newPath = config.baseFolder + config.uploadFolder + '/temp/' + filename;

   		ensureExists(config.baseFolder + config.uploadFolder + '/avatars/' + userId, 0744, function(err) {
    		if (err) {}
    		else {

				var avatarPath = config.baseFolder + config.uploadFolder + "/avatars/" + userId + "/avatar.png";
		  		var thumbPath = config.baseFolder + config.uploadFolder + "/avatars/" + userId + "/thumb.png";

				var avatarSize = {width: 400, height: 400};
				gm(newPath)
				  .resize(avatarSize.width + ">", avatarSize.height, "^>")
				  .gravity('Center')
				  .crop(avatarSize.width + ">", avatarSize.height, "^>")
				  .extent(avatarSize.width, avatarSize.height)
				  .write(avatarPath, function (error) {
				    if (error) console.log('Error - ', error);
				    
				  });

				var thumbSize = {width: 32, height: 32};
				gm(newPath)
				  .resize(thumbSize.width + ">", thumbSize.height, "^>")
				  .gravity('Center')
				  .crop(thumbSize.width + ">", thumbSize.height, "^>")
				  .extent(thumbSize.width, thumbSize.height)
				  .write(thumbPath, function (error) {
				    if (error) console.log('Error - ', error);
		        	console.log("Upload Finished of " + filename);              
					
							    
				  });    			
    		}
		
		});



	} catch (err) {
		console.log(err);
		return false;
	}

	return true;

}

exports.editProfile = editProfile;
function editProfile(userInfo, callback) {

	User.update({ _id: userInfo.userid}, {
		$set : {
			username: userInfo.username,
			name: 	  userInfo.name,
			email:    userInfo.email
		}
	},{ upsert: false}, function(err, doc) {
		if(doc === 1) {
			callback('updated');
		} else {
			callback('error');
		}
	});
}


function ensureExists(path, mask, callback) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        calback = mask;
        mask = 0777;
    }

    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') callback(null); // ignore the error if the folder already exists
            else callback(err); // something else went wrong
        } else callback(null); // successfully created folder
    });
}