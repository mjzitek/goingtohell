var socket = io.connect('http://192.168.0.10:3000');


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


gameInfa.on('winner_notfication', function(data) {
    data = JSON.parse(data);
    writeChat(data);

    $("#played-cards ul").empty();
    $("#white-card-played").val("false");

    amount = 8 - $("#whitecards ul li").size();

    getNewWhiteCards(amount);
});

gameInfa.on('server_notification', function(message) {

    console.log(message);
    $("#server-message").html(message.text);
    $("#game-notification").slideDown();


    $("#server-message").delay(3000).fadeOut();
    $("#game-notification").delay(3000).slideUp();
});


chatCom.on('chat_log', function(data) {

    console.log(data);
    data = JSON.parse(data);
    data.forEach(function(chatLine) {
        writeChat(chatLine);
    });



});

chatCom.on('message', function(data) {
    data = JSON.parse(data);
    writeChat(data);
});


function sendWinningCard(data) {
  //console.log(data);
  gameInfa.emit("winning_card", JSON.stringify(data));
}


function sendChat(data) {
  chatCom.send(JSON.stringify(data));
  $('#chatbox-input').val("");
}

function updatePlayersList(players) {

    $("#userlist ul").empty();

    players.forEach(function(player) {

     var extraInfo = "";
     var photoFaded = "";
     var playStatus = "";
     //console.log(player.username + " played card: " + player.playedCard);

      if(player.status === "AFK" || player.status === "Idle") 
      {

        photoFaded = "faded"
      }


     // console.log(player.username + " " + player.playedCard);

      if(player.cardCzar) {
        playStatus = "Card Czar";
      } else if (player.playedCard) {
        playStatus = "Played Card";
      }

       $("#userlist ul").append(
          "<li class='user' data-id='" + player.id +"'><span class='userphoto " + photoFaded + "'><img class=fa fa-user'" +
          " src='" + (player.avatarUrl ? player.avatarUrl : "img/avatars/default_user.png" ) + "' alt='' />" +
          "</span><div class='usertext'>" +
      
          "<div class='extra-info'> " + player.status +"</div>" +
          "<div class='username'>" + player.username +"</div>" + 
          "<div class='user-points'><span class='user-points-value'> " + player.points + "</span> points</div>" +
          "<div class='card-czar'> " +  playStatus +"</div>"
        );


    });



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

  } else {
    $("#card-czar").val("false");    
    $("#card-czar-overlay").hide();
    $("#playing-area #buttons #pick-card").attr('disabled','disabled');
  }
}


function writeChat(chatLine) {
    var messageType = "";

    console.log(chatLine);



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