$(function() {
	$("#profile-edit").click(function() {
		console.log($(this).data('mode'));

		if($(this).data('mode') === 'edit') {
			showEditProfile();
			console.log("Editing profile");
		} else if ($(this).data('mode') === 'save') {
			saveProfile();
		}

	});

	$('#profile-avatar-edit').click(function() {
		console.log('edit avatar');
		$('#basic-modal-content').modal();
	});

	$('#avatarUpload').submit(function() {
		editAvatar();
		$.modal.close();
	});


});



function showEditProfile() {

	$('#profile-username').html("<input id='profile-username-data' type='text' value='" + $('#profile-username').html() +"'>");
	$('#profile-name').html("<input id='profile-name-data' type='text' value='" + $('#profile-name').html() +"'>");
	$('#profile-email').html("<input id='profile-email-data' type='text' value='" + $('#profile-email').html() +"'>");

	$('.profile-edit-tag').show();

	$('#profile-edit').html('Save');
	$('#profile-edit').data('mode', 'save');


}


function saveProfile() {
	console.log("Saving Profile");

	profileData = {};

	profileData.userid = $('#profile-userid').val();
	profileData.username = $('#profile-username-data').val();
	profileData.name = $('#profile-name-data').val();
	profileData.email = $('#profile-email-data').val();

    $.ajax({
        url: '/users/profile/edit/',
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(profileData),
        success: function (data, textStatus, jqXHR) {
            // do something with your data here.
            console.log(data);

			$('#profile-username').html($('#profile-username-data').val());
			$('#profile-name').html($('#profile-name-data').val());
			$('#profile-email').html($('#profile-email-data').val());

			$('.profile-edit-tag').hide();

			$('#profile-edit').html('Edit Profile');
			$('#profile-edit').data('mode', 'edit');


        },
        error: function (jqXHR, textStatus, errorThrown) {
            // likewise do something with your error here.
        }
    });
}

function editAvatar() {
        $('#avatarUpload').ajaxSubmit({                                                                                                                 
 
            error: function(xhr) {
            	console.log(xhr);
				//status('Error: ' + xhr.status);
            },
 
            success: function(response) {
		        if(response.error) {
		            status('Opps, something bad happened');
		            return;
		        }
		 
		        var imageUrlOnServer = response.path;
		 
				status('Success, file uploaded to:' + imageUrlOnServer);
				$('<img/>').attr('src', imageUrlOnServer).appendTo($('body'));				
            }
	});
 
	// Have to stop the form from submitting and causing                                                                                                       
	// a page refresh - don't forget this                                                                                                                      
	return false;
}
