// Misc functions

function showServerNotfication(message,persist) {
	$("#server-message").show();
	$("#server-message").html(message);
    $("#game-notification").slideDown();

    if(!persist)
    {
     	$("#server-message").delay(3000).fadeOut();
    	$("#game-notification").delay(3000).slideUp();   	
    }


}



function showPlayedWhiteCardText() {
    $('#played-cards li').each(function (index) {
        $(this).children(".whitecard-text").fadeIn();
    });	
   	

}
