var socket = io.connect('http://192.168.0.10:3000');


//socket.emit("set_chat", { id: "531e31aa897073c968e8afe7"});

var chatInfa = io.connect('/chat_infa'),
    chatCom = io.connect('/chat_com');



chatInfa.on('connect', function() {

  var data = {};
  data.userid = $("#player-info #name").data("id");
  data.username = $("#player-info #name #username").html();

  chatInfa.emit("get_players", {});
  chatInfa.emit("join_room", data);
  chatInfa.on("players_list", function(players) {
    //console.log(players);
    updatePlayersList(players);
  });
});


chatInfa.on('message', function(data) {
  data = JSON.parse(data);
  //console.log(data);

  if(data.type === "serverMessage") {
    $("#messages").html("");
    $("#messages").append("<div class='message server-message'>" + data.message + "<div>");
  } 


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

});





function sendChat(data) {
  chatCom.send(JSON.stringify(data));
  $('#chatbox-input').val("");
}

function updatePlayersList(players) {
    //console.log("Updating players list");
    // $("#userlist").html("");

    $("#userlist ul").empty();

    console.log(players);

    players.forEach(function(player) {
        console.log(player);
       // console.log(player.playerInfo);
    });

    players.forEach(function(player) {

     var extraInfo = "";
     var photoFaded = "";

      if(player.status === "AFK" || player.status === "Idle") 
      {
        extraInfo = "AFK";
        photoFaded = "faded"
      }

       $("#userlist ul").append(
          "<li class='user'><span class='userphoto " + photoFaded + "'><img class=fa fa-user'" +
          " src='" + (player.avatarUrl ? player.avatarUrl : "img/default_user.png" ) + "' alt='' />" +
          "</span><div class='usertext'>" +
          "<div class='extra-info'> " + player.status +"</div>" +
          "<div class='username'>" + player.username +"</div>" + 
          "<div class='user-points'><span class='user-points-value'> " + player.points + "</span> points</div>"

        );
    });

    // players.forEach(function(player) {

    //   var idleTime = moment(player.lastPing);

    //   var extraInfo = "";
    //   var photoFaded = "";

    //   if(player.afk) 
    //   {
    //     extraInfo = "AFK";
    //     photoFaded = "faded"
    //   }



    //    $("#userlist ul").append(
    //       "<li class='user'><span class='userphoto " + photoFaded + "'><img class=fa fa-user'" +
    //       " src='" + (player.playerInfo.avatarUrl ? player.playerInfo.avatarUrl : "img/default_user.png" ) + "' alt='' />" +
    //       "</span><div class='usertext'>" +
    //       "<div class='extra-info'> " + extraInfo +"</div>" +
    //       "<div class='username'>" + player.playerInfo.username +"</div>" + 
    //       "<div class='user-points'><span class='user-points-value'> " + player.points + "</span> points</div>"

    //     );
    // });

}


        // div.user
        //   span.userphoto 
        //     <img src="img/photo2.jpg" alt="" />
        //   div.usertext
        //     div.username zblu64
        //     div.user-points 3 points  