// maintain compatibility with other CS50 libraries
var CS50 = CS50 || {};
CS50.Video.Render = CS50.Video.Render || {};

// question types
CS50.Video.QuestionMode = CS50.Video.Mode || {};
CS50.Video.QuestionMode.FLIP = 'flip';
CS50.Video.QuestionMode.PANEL = 'panel';

/**
 * Renderer for a multiple choice question
 *
 */
CS50.Video.Render.MultipleChoice = function(container, data, callback) {
	// render question title
	var $container = $(container);
	$container.append('<h2>' + data.question + '</h2>');

	// display each choice
	$choices = $('<div class="question-choices">');
	_.each(data.choices, function(e, i) {
		$choices.append('<input id="' + i + '" type="radio" name="question" value="' + i + '" />' + 
			'<label for="' + i + '">' + e + '</label><br />');
	});

	// create submit button, hidden by default
	var $submit = $('<button class="btn btn-submit">Submit Response</button>').hide();

	// add display questions
	$container.append($choices);
	$container.append($submit);

	// when submit button is pressed, check the answer
	$container.on('click', '.btn-submit', function(e) {
		// remove previous messages from the container
		var $container = $(this).parents('.question-content');
		$container.find('.alert').remove();

		// create message to be shown depending on correctness of answer
		if (data.answer == $container.find('input[type=radio]:checked').val())
			var $message = $('<div class="alert alert-success"><strong>Correct!</strong></div>');		
		else
			var $message = $('<div class="alert alert-error">That\'s not the right answer, <strong>try again!</strong></div>');
	
		// display message
		$message.hide().appendTo($container).fadeIn('fast');

		e.preventDefault();
		return false;
	});

	// when answer is selected, make sure submit button is show
	$container.on('click', '.question-choices input[type=radio]', function() {
		$submit = $container.find('.btn-submit');
		if (!$submit.is(':visible')) {
			$submit.fadeIn('fast');
		}
	});
};

/**
 * Renderer for a multiple choice question
 *
 */
CS50.Video.Render.FreeResponse = function(container, data, callback) {
	// render question and input area
	var $container = $(container);
	$container.append('<h2>' + data.question + '</h2>');
	$container.append('<input class="txt-answer" type="text" /><br />')

	// create submit button, hidden by default
	var $submit = $('<button class="btn btn-submit">Submit Response</button>').hide();
	$container.append($submit);

	// when submit button is pressed, check the answer
	$container.on('click', '.btn-submit', function(e) {
		// remove previous messages from the container
		var $container = $(this).parents('.question-content');
		$container.find('.alert').remove();

		// create message to be shown depending on correctness of answer
		if ($container.find('.txt-answer').val().match(data.answer))
			var $message = $('<div class="alert alert-success"><strong>Correct!</strong></div>');		
		else
			var $message = $('<div class="alert alert-error">That\'s not the right answer, <strong>try again!</strong></div>');
	
		// display message
		$message.hide().appendTo($container).fadeIn('fast');

		e.preventDefault();
		return false;
	});

	// when answer is selected, make sure submit button is shown
	$container.on('keyup', '.txt-answer', function() {
		var $submit = $(this).siblings('.btn-submit');

		// toggle submit button based on input state
		if ($(this).val().match(/^\s*$/) && $submit.is(':visible'))
			$submit.fadeOut('fast');
		else if (!$submit.is(':visible'))
			$submit.fadeIn('fast');
	});
};