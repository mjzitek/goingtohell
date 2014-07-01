var socket = io.connect('http://192.168.0.10:3000');


//socket.emit("set_chat", { id: "531e31aa897073c968e8afe7"});

var chatInfa = io.connect('/chat_infa'),
    chatCom = io.connect('/chat_com'),
    gameInfa = io.connect('/game_infa');


gameInfa.on('connect', function() {
    console.log("Connecting and getting card data");
    chatInfa.emit("get_cards", {});
})

gameInfa.on("cards_list", function(cards) {
    console.log("Received card list");
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
    //console.log(players);
    updatePlayersList(players);
});

chatInfa.on('message', function(data) {
  data = JSON.parse(data);
  //console.log(data);

  if(data.type === "serverMessage") {
    $("#messages").html("");
    $("#messages").append("<div class='message server-message'>" + data.message + "<div>");
  } 


});


gameInfa.on('winner_notfication', function(data) {
  data = JSON.parse(data);
  console.log(data);
  console.log("Winner " + data[0].username);
    $("#messages").append("<div class='message winner-message'>" + data[0].username + 
                          " is the winner of this round</span><div>");    

    $("#played-cards ul").empty();

    amount = 8 - $("#whitecards ul li").size();
    console.log("Getting " + amount + " white card(s)...");
    getNewWhiteCards(amount);
});


chatCom.on('message', function(data) {
  data = JSON.parse(data);
  //console.log(data);

  var messageType = "";

  if(data.type === "playerMessage")
  {
      messageType = "player-message";
  } else if (data.type === "playerStatus") {
      messageType = "player-status";
  }

 if(data.type === "playerMessage" || data.type === "playerStatus"){
    $("#messages").append("<div class='message " + messageType +"'><span class='username'>" + data.username + 
                          "</span><span class='text'>" + data.message + "</span><div>");    
  }


  $("#messages").scrollTop($(document).height());

});


function sendWinningCard(data) {
  console.log(data);
  gameInfa.emit("winning_card", JSON.stringify(data));
}


function sendChat(data) {
  chatCom.send(JSON.stringify(data));
  $('#chatbox-input').val("");
}

function updatePlayersList(players) {
    //console.log("Updating players list");
    // $("#userlist").html("");

    $("#userlist ul").empty();

   // console.log(players);

    // players.forEach(function(player) {
    //     //console.log(player);
    //    // console.log(player.playerInfo);
    // });

    players.forEach(function(player) {

     var extraInfo = "";
     var photoFaded = "";

      if(player.status === "AFK" || player.status === "Idle") 
      {
        extraInfo = "AFK";
        photoFaded = "faded"
      }

       $("#userlist ul").append(
          "<li class='user' data-id='" + player.id +"'><span class='userphoto " + photoFaded + "'><img class=fa fa-user'" +
          " src='" + (player.avatarUrl ? player.avatarUrl : "img/avatars/default_user.png" ) + "' alt='' />" +
          "</span><div class='usertext'>" +
          "<div class='extra-info'> " + player.status +"</div>" +
          "<div class='username'>" + player.username +"</div>" + 
          "<div class='user-points'><span class='user-points-value'> " + player.points + "</span> points</div>"

        );


    });



}

function updateCards(cards) {
  console.log(cards);

  updateCzar(cards[0].currentCardCzar);

  $("#blackcard-text").html(cards[0].blackCardActive.text);




  //$("#played-cards ul").empty();
  cards[0].whiteCardsActive.forEach(function(card) {
        
      var found = false;

        $("#played-cards li").each(function(index) {
            //console.log(index + ": " + $(this).data("id"));
            if($(this).data("id") === card.whitecard._id) {
              //console.log("** Card found");
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
    $("#playing-area #buttons #pick-card").removeAttr('disabled');
  } else {
    $("#card-czar").val("false");    
    $("#card-czar-overlay").hide();
    $("#playing-area #buttons #pick-card").attr('disabled','disabled');
  }
}

