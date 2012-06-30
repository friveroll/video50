$(function() {
	var questions = [
		{
			timestamp: 0,
			question: 'Is David wearing a v-neck?',
			choices: [ 'Yes', 'No' ],
			answer: 0
		},
		{
			timestamp: 5,
			question: 'How many TFs are there?',
			choices: [ '100', '40', '50', '10' ],
			answer: 2
		}
	];

	function checkQuestionAvailable(player) {
		_.each(questions, function(e, i) {
			if (e.timestamp == Math.floor(player.currentTime) &&
					!$('button[data-index=' + i + ']').length) {

				var $button = $('<button>').attr('data-index', i).addClass('btn btn-primary btn-show-question')
					.text('Question ' + i + ' is available!');
				$('#question-notifications-container').append($button);
			}
		})
	}

	function showQuestion(index) {
		var question = questions[index];
		var $container = $('#question-content');
		$container.attr('data-question-id', index);

		// construct question and choices
		$container.empty().append('<h2>' + questions[index].question + '</h2>');
		$choices = $('<div class="question-choices">');
		_.each(question.choices, function(e, i) {
			$choices.append('<input id="' + i + '" type="radio" name="question" value="' + i + '" />' + 
				'<label for="' + i + '">' + e + '</label><br />');
		});
		$container.append($choices);

		// stop video so we can think, think, thiiiiiink
		player.pause();
		$('#video-container').fadeOut('medium');
		$('#flip-container').addClass('flipped');
	}

	$('#container').on('click', '.btn-show-question', function(e) {
		var index = $(this).attr('data-index');
		showQuestion(index);

		$(this).remove();
	});

	$('#container').on('click', '.btn-show-video', function(e) {
		player.play();
		$('#flip-container').removeClass('flipped');

		setTimeout(function() {
			$('#video-container').fadeIn('medium');
		}, 500);
	});

	$('#container').on('click', '.question-choices input[type=radio]', function() {
		// determine the current question
		var question = questions[$('#question-content').attr('data-question-id')];

		// remove previous messages from the container
		var $container = $(this).parents('.question-choices');
		$container.find('.alert').remove();

		// create message to be shown depending on correctness of answer
		if (question.answer == $(this).val())
			var $message = $('<div class="alert alert-success"><strong>Correct!</strong></div>');		
		else
			var $message = $('<div class="alert alert-error">That\'s not the right answer, <strong>try again!</strong></div>');
	
		// display message
		$message.hide().appendTo($container).fadeIn('fast');

		// if back to video button isn't shown, then show it
		if (!$container.siblings('.btn-show-video').length) {
			var $button = $('<button class="btn btn-show-video"><i class="icon-chevron-left"></i> Back to video</button>').hide();
			$container.after($button);
			$button.fadeIn('fast');
		}
	});

	var player = new MediaElementPlayer('#player', {
		success: function (player, dom) { 
			player.addEventListener('timeupdate', function(e) {
				checkQuestionAvailable(player);
			}, false);

			player.play();
		}
	});	
});