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
    console.log(players);
    updatePlayersList(players);
  });
});


chatInfa.on('message', function(data) {
  data = JSON.parse(data);
  console.log(data);

  if(data.type === "serverMessage") {
    $("#messages").html("");
    $("#messages").append("<div class='message server-message'>" + data.message + "<div>");
  } 


});


chatCom.on('message', function(data) {
  data = JSON.parse(data);
  console.log(data);

 if(data.type === "playerMessage"){
    $("#messages").append("<div class='message player-message'><span class='username'>" + data.username + 
                          "</span><span class='text'>" + data.message + "</span><div>");    
  }

});





function sendChat(data) {
  chatCom.send(JSON.stringify(data));
  $('#chatbox-input').val("");
}

function updatePlayersList(players) {
    console.log("Updating players list");
    // $("#userlist").html("");

    $("#userlist ul").empty();

    players.forEach(function(player) {
       $("#userlist ul").append(
          "<li class='user'><span class='userphoto'><img class=fa fa-user' src='img/default_user.png' alt='' /></span><div class='usertext'><div class='username'>" + player.username +
          "</div><div class='user-points'><span class='user-points-value'>0</span> points</div>"
        )
    });

}


        // div.user
        //   span.userphoto 
        //     <img src="img/photo2.jpg" alt="" />
        //   div.usertext
        //     div.username zblu64
        //     div.user-points 3 points  