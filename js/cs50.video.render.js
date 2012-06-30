// maintain compatibility with other CS50 libraries
var CS50 = CS50 || {};
CS50.Video.Render = CS50.Video.Render || {};

CS50.Video.Render.MultipleChoice = function(container, data, callback) {
	var $container = $(container);

	// render question title
	$container.append('<h2>' + data.question + '</h2>');

	// display each choice
	$choices = $('<div class="question-choices">');
	_.each(data.choices, function(e, i) {
		$choices.append('<input id="' + i + '" type="radio" name="question" value="' + i + '" />' + 
			'<label for="' + i + '">' + e + '</label><br />');
	});
	$container.append($choices);

	// event handler for selecting an answer
	$container.on('click', '.question-choices input[type=radio]', function() {
		// remove previous messages from the container
		var $container = $(this).parents('.question-choices');
		$container.find('.alert').remove();

		// create message to be shown depending on correctness of answer
		if (data.answer == $(this).val())
			var $message = $('<div class="alert alert-success"><strong>Correct!</strong></div>');		
		else
			var $message = $('<div class="alert alert-error">That\'s not the right answer, <strong>try again!</strong></div>');
	
		// display message
		$message.hide().appendTo($container).fadeIn('fast');
	});
};