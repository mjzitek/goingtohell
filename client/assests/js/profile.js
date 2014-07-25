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
});



function showEditProfile() {

	$('#profile-username').html("<input id='profile-username-data' type='text' value='" + $('#profile-username').html() +"'>");
	$('#profile-name').html("<input id='profile-name-data' type='text' value='" + $('#profile-name').html() +"'>");
	$('#profile-email').html("<input id='profile-email-data' type='text' value='" + $('#profile-email').html() +"'>");

	//$('#profile-avatar').html($('#profile-avatar').html() + " <a href=''>Edit Photo</a>");

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



			$('#profile-edit').html('Edit Profile');
			$('#profile-edit').data('mode', 'edit');


        },
        error: function (jqXHR, textStatus, errorThrown) {
            // likewise do something with your error here.
        }
    });
}
