$(document).ready(function() {
	$("#registerForm").submit(function() {
		var email = $(this).find("input[name='email']").val();
		var username = $(this).find("input[name='username']").val();
		var password = $(this).find("input[name='password']").val();
		var password2 = $(this).find("input[name='password2']").val();
		$.getJSON({
			url : '/register',
			type : 'POST',
			data : {
				'email' : email,
				'username' : username,
				'password' : password,
				'password2' : password2
			},
			beforeSend:function() {
				$.blockUI();
			},
			success: function(data) {
				window.location.href = '/';
			},
			error: function(request, status, error) {
				alert(request.responseJSON.detail);
			},
			complete:function() {
				$.unblockUI();
			}
		});
		return false;
	});

	$("#addQuestionForm").submit(function() {
		var question = $(this).find("input[name='question']").val();
		$.getJSON({
			url : '/questions',
			type : 'POST',
			data : {
				'question' : question
			},
			beforeSend:function() {
				$.blockUI();
			},
			success: function(data) {
				window.location.href = window.location.href;
			},
			error: function(request, status, error) {
				alert(2);
			},
			complete:function() {
				$.unblockUI();
			}
		});
		return false;
	});

	
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
				beforeSend:function() {
					$.blockUI();
				},
				success: function(data) {
					window.location.href = window.location.href;
				},
				error: function(request, status, error) {
					alert(2);
				},
				complete:function() {
					$.unblockUI();
				}
			});
		}
	});
	
	$('.question-item').on('click','.delete',function(event) {
		var mine = $(this).closest('.question-item').attr('data-mine')==='true';
		if (!mine) {
			alert("Can't delete questions that you did not create!");
		} else if (confirm("Are you sure you want to delete this question?")) {
			var questionID = $(this).closest('.question-item').attr('data-id');
			var type = $(this).attr("data-action");
			$.ajax({
				url : '/questions/' + questionID + '/delete',
				type : 'POST',
				data : {
				},
				beforeSend:function() {
					$.blockUI();
				},
				success: function(data) {
					window.location.href = window.location.href;
				},
				error: function(request, status, error) {
					alert(2);
				},
				complete:function() {
					$.unblockUI();
				}
			});
		}
	});
	
	$('.question-item').on('click','.edit',function(event) {
		var mine = $(this).closest('.question-item').attr('data-mine')==='true';
		if (!mine) {
			alert("Can't edit questions that you did not create!");
		} else {
			var old_question = $(this).closest('.question-item').find('h4').text().trim();
			var question = prompt("Enter edited question", old_question);
			if (question) {
				var questionID = $(this).closest('.question-item').attr('data-id');
				$.ajax({
					url : '/questions/' + questionID,
					type : 'POST',
					data : {
						'question' : question
					},
					beforeSend:function() {
						$.blockUI();
					},
					success: function(data) {
						window.location.href = window.location.href;
					},
					error: function(request, status, error) {
						alert(2);
					},
					complete:function() {
						$.unblockUI();
					}
				});
			}
		}
	});
});