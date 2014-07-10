var socket = io.connect(Config.hostserver + ':' + Config.port);


//socket.emit("set_chat", { id: "531e31aa897073c968e8afe7"});

var chatInfa = io.connect('/chat_infa'),
    chatCom = io.connect('/chat_com'),
    gameInfa = io.connect('/game_infa');


gameInfa.on('connect', function() {
    //console.log("Connecting and getting card data");
    chatInfa.emit("get_cards", {});
})

gameInfa.on("cards_list", function(cards) {
    //console.log("Received card list");
    updateCards(cards);
});




chatInfa.on('connect', function() {

  var data = {};
  data.userid = $("#player-info #name").data("id");
  data.username = $("#player-info #name #username").html();

  chatInfa.emit("get_players", {});
  chatInfa.emit("join_room", data);


});

chatInfa.on("players_list", function(players) {
    updatePlayersList(players);
});

chatInfa.on('message', function(data) {
    data = JSON.parse(data);
    writeChat(data);
});

chatInfa.on("player_disconnected", function(data) {
    //data = JSON.parse(data);
    removePlayer(data);
});

gameInfa.on('winner_notfication', function(data) {
    data = JSON.parse(data);
    writeChat(data);
});

gameInfa.on('new_round', function() {
    setNewRound();
});

chatInfa.on('new_round', function() {
    setNewRound();
});

gameInfa.on('server_notification', function(message) {
    showServerNotfication(message.text, false);
});


chatCom.on('chat_log', function(data) {

   // console.log(data);
    data = JSON.parse(data);
    data.forEach(function(chatLine) {
        writeChat(chatLine);
    });



});

chatCom.on('message', function(data) {
    data = JSON.parse(data);
    writeChat(data);
});


function setNewRound() {

    $("#played-cards ul").empty();
    $("#white-card-played").val("false");

    amount = 8 - $("#whitecards ul li").size();

    getNewWhiteCards(amount);

    $("#playing-area").children(".whitecard-text").hide();
}

function sendWinningCard(data) {
  //console.log(data);
  gameInfa.emit("winning_card", JSON.stringify(data));
}


function sendChat(data) {
  chatCom.send(JSON.stringify(data));
  $('#chatbox-input').val("");
}

function updatePlayersList(players) {

    //$("#userlist ul").empty();


    var totalPlayers = 0;
    var totalAvailablePlayers = 0;
    var totalPlayedPlayers = 0;

    players.forEach(function(player) {
        updatePlayer(player);
    });



}

function updatePlayer(player) {

    var playerInList = false;
    var playerIndex = 0;

    var extraInfo = "";
    var photoFaded = "";
    var playStatus = "";

    if($("#userlist li")) {
        $("#userlist li").each(function(index) {
            if($(this).data("id") == player.id) {
                playerInList = true;
                playerIndex = index;
            }
        });
    }

    if(player.cardCzar) {
        playStatus = "Card Czar";
    } else if (player.playedCard) {
        playStatus = "Played Card";
    } else {
        playStatus = "";
    }

    if(player.status === "AFK" || player.status === "Idle") 
    {

        photoFaded = "faded"
    }  else {
        photoFaded = "";
    }  

    if(!playerInList)
    {

        $("#userlist ul").append(
            "<li class='user' data-id='" + player.id +"'><span class='userphoto " + photoFaded + "'><img class='fa fa-user'" +
            " src='" + (player.avatarUrl ? player.avatarUrl : "/img/avatars/default_user.png" ) + "' alt='' />" +
            "</span><div class='usertext'>" +
          
            "<div class='extra-info'> " + player.status +"</div>" +
            "<div class='username'>" + player.username +"</div>" + 
            "<div class='user-points'><span class='user-points-value'> " + player.points + "</span> points</div>" +
            "<div class='play-status'> " +  playStatus +"</div>"
        );    
    } else {

        var playerItem = $("#userlist li:eq("+ playerIndex +")");
        //console.log($(playerItem).data("id"));
        
        var imgSrc = $(playerItem).children(".userphoto").children("img").prop("src");
        var points = $(playerItem).children(".usertext").children(".user-points").children(".user-points-value").html();
        var status   = $(playerItem).children(".usertext").children(".play-status").html();
        var extra  = $(playerItem).children(".usertext").children(".extra-info").html();
        //console.log(points);

        var newAvatar = (player.avatarUrl ? player.avatarUrl : "/img/avatars/default_user.png" )


        //console.log(czar);
        // console.log(player.username + " => " + status + " / " + extra + " / " + points);
        // console.log(playStatus);

        if(imgSrc.indexOf(newAvatar) === -1 )
        {
            $(playerItem).children(".userphoto").children("img").attr("src", newAvatar);
        }



        if(points != player.points)
        {
            $(playerItem).children(".usertext").children(".user-points").children(".user-points-value").html(player.points);
        }

            

        if(extra != player.status) {
            $(playerItem).children(".usertext").children(".extra-info").html(player.status)

            //console.log(player.username + " ***************** " + photoFaded);

            if(photoFaded === "faded") {
                $(playerItem).children(".userphoto").addClass("faded");
            } else {
                $(playerItem).children(".userphoto").removeClass("faded"); 
            }
        }

        if(status != playStatus) {
            $(playerItem).children(".usertext").children(".play-status").html(playStatus)
        }

    }


}

function removePlayer(playerId) {
    //console.log('Removing ' + playerId);
    if($("#userlist li")) {
        $("#userlist li").each(function(index) {
            if($(this).data("id") == playerId) {
                $(this).remove();
            }
        });
    }
}

function updateCards(cards) {
    updateCzar(cards[0].currentCardCzar);

    $("#blackcard-text").html(cards[0].blackCardActive.text);

    cards[0].whiteCardsActive.forEach(function(card) {
        
      var found = false;

        $("#played-cards li").each(function(index) {
            if($(this).data("id") === card.whitecard._id) {
                found = true;
            } 
        });

        if(!found)
        {
          var card = "<li class='whitecard' data-id='" + card.whitecard._id + "' data-playerid='" + card.playerInfo +"'>" +
              "<span class='whitecard-text'>" + card.whitecard.text + "</span></li>";

          $("#played-cards ul").append(card);          

        }
            
        if($( "#played-cards ul li" ).size() > 5) {
            $('#played-cards ul li').each(function (index) {
                $(this).addClass("whitecard-sm");
            });            
        }
  });


}


function updateCzar(czar) {

  if($("#player-info #name").data("id") === czar) {
    $("#card-czar").val("true");
    $("#card-czar-overlay").show();
    $("#pick-card").show();

  } else {
    $("#card-czar").val("false");    
    $("#card-czar-overlay").hide();
    $("#playing-area #buttons #pick-card").attr('disabled','disabled');
    $("#pick-card").hide();
  }
}


function writeChat(chatLine) {
    var messageType = "";

   // console.log(chatLine);



    switch(chatLine.type) {
        case 'playerMessage':
        case 'playerStatus':
              if(chatLine.type === "playerMessage")
              {
                  messageType = "player-message";
              } else if (chatLine.type === "playerStatus") {
                  messageType = "player-status";
              }

            $("#messages").append("<div class='message " + messageType +"'><span class='username'>" + 
                chatLine.username + 
                "</span><span class='text'>" + chatLine.message + "</span><div>"); 

            break;

        case 'winnerNotfication':
            $("#messages").append("<div class='message winner-message'>" + 
                    (chatLine.message != null ? chatLine.message : chatLine.username) + 
                    " is the winner of this round</span><div>");    
            break;
        case 'serverMessage':
            $("#messages").append("<div class='message server-message'>" + chatLine.message + "<div>");
            break;
    }

    $("#messages").scrollTop($(document).height());
}


function allowWinnerSelection() {

}