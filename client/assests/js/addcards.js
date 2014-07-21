
$(function() {

	$.fn.serializeObject = function()
    {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    }; 



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

	$('#submit').click(function(event) {
		submitData();
		event.preventDefault();
	});

	$('#cards-listing').children('.card').click(function() {
		console.log($(this).data("id"));
		editCard($(this).data("id"), $("#cardType").val());
	});

});


function submitData() {

	data = JSON.stringify($("#addcard-form").serializeObject())

	console.log(data);

	var url;

	if($('#cardId').val() != 'undefined') {
		url = '/cards/edit/';
	} else {
		url = '/cards/addcard/';
	}

    $.ajax({
        url: url,
        type: "GET",
        contentType: "application/json",
        data: data,
        success: function (data, textStatus, jqXHR) {
            // do something with your data here.
            console.log(data);
            $('#message').html(data.message);
            $('#message').addClass(data.msg_class);
            $('#message').show();

            $("#message").delay(1000).fadeOut(2000);

            clearCard();

        },
        error: function (jqXHR, textStatus, errorThrown) {
            // likewise do something with your error here.
        }
    });


}

function editCard(cardId, cardType) {
	window.location.href = "/cards/edit/" + cardId + "/" + cardType
}


function clearCard() {
	$('#card_text').val("");
}



