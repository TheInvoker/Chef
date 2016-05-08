$(document).ready(function() {
	
	/*
	$("#loginForm").submit(function() {
		var email = $(this).find("input[name='email']").val(),
			password = $(this).find("input[name='password']").val();
		$.getJSON({
			url : '/login',
			type : 'POST',
			data : {
				'email' : email,
				'password' : password
			},
			success: function(data) {
				if (data.message == 'ok') {
					window.location
				}
			},
			error: function(request, status, error) {
				$('#info').html('<p>An error has occurred</p>');
			}
		});
		return false;
	});
	*/
	
	$('.question-item').on('click','.icon',function(event) {
		var mine = $(this).closest('.question-item').attr('data-mine')==='true';
		if (mine) {
			alert("Can't vote for your own post!");
		} else {
			var questionID = $(this).closest('.question-item').attr('data-id');
			var type = $(this).attr("data-action");
			$.ajax({
				url : '/questions/' + questionID + '/' + type,
				type : 'POST',
				data : {
				},
				success: function(data) {
					window.location.href = window.location.href;
				},
				error: function(request, status, error) {
					alert(2);
				}
			});
		}
	});
});