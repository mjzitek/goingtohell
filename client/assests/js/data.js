var socket = io.connect('http://192.168.1.10:3000');


socket.emit("set_village", { id: "531e31aa897073c968e8afe7"});

socket.on('inventory', function(items) {
  //console.log(data.contents);
  var inventory = "";
  var buildings = "";
  
  items.contents.forEach(function(item) {
    if(item.itemInfo.name == "food"  || item.itemInfo.name == "wood"  || item.itemInfo.name == "stone" ) {
       inventory += "<div><span>" + item.itemInfo.commonName + "</span>: <span>" + item.quantity + "</span></div>";
    }
    else {
      buildings += "<div><span>" + item.itemInfo.commonName + "</span>: <span>" + item.quantity + "</span></div>";
    }
  });

  document.getElementById('inventory-items').innerHTML =
  '<p>' + inventory + '</p>';

    document.getElementById('inventory-buildings').innerHTML =
  '<p>' + buildings + '</p>';
});


socket.on('info', function(info) {

  document.getElementById('population-total').innerHTML = info.contents.population.total;

});

