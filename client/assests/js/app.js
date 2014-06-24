$(function() {

	$("#newblackcard").click(function() {
		getNewBlackCard();
        getNewWhiteCards();
	})



});



function getNewBlackCard() {
        $.ajax({
            dataType: 'jsonp',
            //data: data,
            type: "GET",
            //jsonp: 'jsonp_callback',
            url: 'http://' + Config.hostserver +  ':3000/blackcard/',
            success: function (res) {
                console.log(res.text);
                $("#blackcard-text").html(res.text);
            },
            error: function( xhr, status, errorThrown ) {
                alert( "Sorry, there was a problem!" );
                console.log( "Error: " + errorThrown );
                console.log( "Status: " + status );
                console.dir( xhr );
            } 

        });
}


function getNewWhiteCards() {
    $("#whitecards").html();

    var output = "";

    $.ajax({
        dataType: 'jsonp',
        //data: data,
        type: "GET",
        //jsonp: 'jsonp_callback',
        url: 'http://' + Config.hostserver +  ':3000/whitecards/8',
        success: function (res) {
            console.log(res);
            res.cards.forEach(function(c) {
                output += "<span class='whitecard'><span class='whitecard-text'>" + c.text + "</span></span>"
            });

            $("#whitecards").html(output);
        },
        error: function( xhr, status, errorThrown ) {
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        } 

    });
}