$(document).ready(function() {
	

	$("#addQuestionForm").submit(function() {
		var question = $(this).find("input[name='question']").val();
		$.getJSON({
			url : '/questions',
			type : 'POST',
			data : {
				'question' : question
			},
			success: function(data) {
				window.location.href = window.location.href;
			},
			error: function(request, status, error) {
				alert(2);
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
				success: function(data) {
					window.location.href = window.location.href;
				},
				error: function(request, status, error) {
					alert(2);
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
				success: function(data) {
					window.location.href = window.location.href;
				},
				error: function(request, status, error) {
					alert(2);
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
					success: function(data) {
						window.location.href = window.location.href;
					},
					error: function(request, status, error) {
						alert(2);
					}
				});
			}
		}
	});
});