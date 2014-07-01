$(function() {

    getNewWhiteCards(8);

	// $("#newblackcard").click(function() {
	// 	getNewBlackCard();
 //        getNewWhiteCards(8);
	// })

    $("#new-round").click(function() {
        setNewRound($("#gamesession").val());
    });

    $("#pick-card").click(function() {
        var selectedCardId = $("#played-cards ul").children("ul li.selected").data("id");
        var selectedPlayerId = $("#played-cards ul").children("ul li.selected").data("playerid");

        var playerId = $("#player-info #name").data("id");

        setWinningCard($("#gamesession").val(), selectedCardId, selectedPlayerId, playerId);
    });

    $("#played-cards").on("click", "li.whitecard",  function() {
        $('#played-cards li').each(function (index) {
            $(this).removeClass("selected");
        });

        $(this).addClass('selected');

    });

    $("#whitecards").on("click", "li.whitecard", function() {
        $('#whitecards li').each(function (index) {
            $(this).removeClass("selected");
        });

        if($( "#played-cards ul li" ).size() < 18)
        {
            $(this).addClass('selected');
            $("#played-cards ul").append(this);
            
            console.log("Player " + $("#player-info #name").data("id") + 
                        " played card " + $(this).data("id") + " on game " + $("#gamesession").val() )

                        // userid, cardid, sessionid 
            playCard($("#player-info #name").data("id"), $(this).data("id"), $("#gamesession").val())
        }


        if($( "#played-cards ul li" ).size() > 5) {
            $('#played-cards ul li').each(function (index) {
                $(this).addClass("whitecard-sm");
            });            
        }


    });

    $("#chatbox-submit").click(function() {
        var data = {};
        data.type = "playerMessage";
        data.userid = $("#player-info #name").data("id");
        data.username = $("#player-info #name #username").html();
        data.message = $('#chatbox-input').val();

        if(data.message != "")
            sendChat(data);
    });



    $("#chatbox-input").on("keypress", function(e) {
            if (e.keyCode == 13) {
            var data = {};
            data.type = "playerMessage";
            data.userid = $("#player-info #name").data("id");
            data.username = $("#player-info #name #username").html();
            data.message = $('#chatbox-input').val();

            if(data.message != "")
                sendChat(data);
        }
    });

    $("#userlist").on("dblclick", "li.user", function() {
        setNewCzar($(this).data("id"));
    })


});

function setNewCzar(playerId) {
    $.post('http://' + Config.hostserver +  ':3000/setczar/' + playerId, function(data) {
        console.log(data);
    });
}



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
                //alert( "Sorry, there was a problem!" );
                console.log( "Error: " + errorThrown );
                console.log( "Status: " + status );
                console.dir( xhr );
            } 

        });
}


function getNewWhiteCards(amount) {
    $("#whitecards").html();

    var output = "";

    $.ajax({
        dataType: 'jsonp',
        //data: data,
        type: "GET",
        //jsonp: 'jsonp_callback',
        url: 'http://' + Config.hostserver +  ':3000/whitecards/' + amount,
        success: function (res) {
            console.log(res);
            res.cards.forEach(function(c) {
                $("#whitecards ul").append("<li class='whitecard' data-id='" + c._id + 
                    "'><span class='whitecard-text'>" + c.text + "</span></li>");
            });

            //$("#whitecards").html(output);
        },
        error: function( xhr, status, errorThrown ) {
            //alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + status );
            console.dir( xhr );
        } 

    });
}

function playCard(playerId, cardId, sessionId) {
    $.post( 'http://' + Config.hostserver +  ':3000/playcard/' + playerId + '/' + cardId + '/' + sessionId, function( data ) {
      console.log(data);
    });

}

function setNewRound(sessionId) {
    $.post('http://' + Config.hostserver +  ':3000/newround/' + sessionId, function(data) {
        console.log(data);
    });
}

function setWinningCard(sessionId, winningCardId, winningPlayerId, playedById) {

    var data = {};

    data.messsageType = "winning-card";
    data.sessionId = sessionId;
    data.winningCardId = winningCardId;
    data.winningPlayerId = winningPlayerId;
    data.playedById = playedById;

    sendWinningCard(data);

}