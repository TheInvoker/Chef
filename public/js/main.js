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
});