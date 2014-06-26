$(function() {

	$("#message").delay(1000).fadeOut(2000);

	$("#card_category")
	     .append($("<option></option>")
         .attr("value","53a8c93f1f55d70e969cda40")
         .text("Test")); 

	$("#addcard-form")
		.append("<input type='hidden' id='username' name='username' value='" + $("#player-info #username").html() + "'>")
		.append("<input type='hidden' id='userid' name='userid' value='" + $("#player-info #name").data("id") + "'>")

	var lastCardType = $("#last-card-type").val();
	console.log($("#last-card-type").val());
	if(lastCardType === "white") {
		$('#radio-white').attr('checked', true);
		$("#card_text").removeClass("card_text-blackcard");
		$("#card_text").addClass("card_text-whitecard");		
	}


	$("input[name='card_type']").change(function() {
		console.log('card_type');
		console.log($("input[name='card_type']:checked").val());
		if($("input[name='card_type']:checked").val() === "white") {
			$("#card_text").removeClass("card_text-blackcard");
			$("#card_text").addClass("card_text-whitecard");			
		} else {
			$("#card_text").removeClass("card_text-whitecard");
			$("#card_text").addClass("card_text-blackcard");
		}
	});



});