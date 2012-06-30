// maintain compatibility with other CS50 libraries
var CS50 = CS50 || {};

/**
 * CS50 Video constructor
 *
 * @param options Player options
 *
 */
CS50.Video = function(options) {
	this.options = options;

	// make sure default options are defined
	if (!this.options.playerContainer)
		throw 'Error: You must define a container for the player!';
	if (!this.options.notificationsContainer)
		throw 'Error: You must define a container for the list of questions!';
	if (!this.options.video)
		throw 'Error: You must define a video to play!';

	// specify default values for optional parameters
	this.options.autostart = (options.autostart === undefined) ? true : options.autostart;
	this.options.height = (options.height === undefined) ? 360 : options.height;
	this.options.questions = (options.questions === undefined) ? [] : options.questions;
	this.options.srt = (options.srt === undefined) ? null : options.srt;
	this.options.swf = (options.swf === undefined) ? './flashmediaelement.swf' : options.swf;
	this.options.title = (options.title === undefined) ? '' : options.title;
	this.options.width = (options.width === undefined) ? 640 : options.width;

	// templates for plugin
	templateHtml = {
		panelQuestion: ' \
			<div class="video50-question"> \
				<button type="button" class="panel-close close">&times;</button> \
				<div class="question-content"></div> \
			</div> \
		',

		player: ' \
			<div class="video50-player" style="width: <%= width %>px; height: <%= 38 + height %>px"> \
				<div class="player-navbar"> \
					<button class="btn btn-back"><i class="icon-arrow-left"></i> Back</button> \
					<div class="player-navbar-title"><%= title %></div> \
				</div> \
				<div class="flip-container"> \
					<div class="video-container" style="width: <%= width %>px; height: <%= height %>px"> \
						<video width="<%= width %>" height="<%= height %>" class="video-player" controls="controls"> \
							<% if (srt) { %> \
								<track kind="subtitles" src="<%= srt %>" srclang="en" /> \
							<% } %> \
				            <source type="video/mp4" src="<%= video %>" /> \
							<object width="<%= width %>" height="<%= height %>" type="application/x-shockwave-flash" data="<%= swf %>"> \
						        <param name="movie" value="<%= swf %>" /> \
						        <param name="flashvars" value="controls=true&file=<%= video %>" /> \
						    </object> \
						</video> \
					</div> \
					<div class="flip-question-container video50-question" style="width: <%= width %>px; height: <%= height %>px"> \
						<div class="question-content"></div> \
					</div> \
				</div> \
			</div> \
		',

		notifications: ' \
			<div class="video50-notifications"> \
				<table class="table table-bordered table-striped"> \
					<thead> \
						<tr> \
							<td><strong>Available Questions</strong></td> \
						</tr> \
					</thead> \
					<tbody></tbody> \
				</table> \
			</div> \
		',

		notification: ' \
			<tr data-question-id="<%= question.question.id %>"> \
				<td > \
					<a href="#" rel="tooltip" title="<%= question.question.question %>"> \
						<%= question.question.tags.join(", ") %> \
					</a> \
				</td> \
			</tr> \
		',

		transcript: ' \
			<div class="video50-transcript-container"> \
				<div class="video50-transcript"> \
				</div> \
			</div> \
		'
	};

	// compile templates
    this.templates = {};
    for (var template in templateHtml)
        this.templates[template] = _.template(templateHtml[template]);

    // instantiate video
	this.createPlayer();
	this.createNotifications();
	this.loadSrt();
};

/**
 * Check if a new question is available, adding it to the notifications container if so
 *
 */
CS50.Video.prototype.checkQuestionAvailable = function() {
	var player = this.player;
	var $container = $(this.options.notificationsContainer).find('tbody');

	// check if any of the given questions should be displayed at this timecode
	var me = this;
	_.each(this.options.questions, function(e, i) {
		// question should be shown if timecodes match and it isn't already shown
		if (e.timecode == Math.floor(player.getCurrentTime()) && 
				!$container.find('tr[data-question-id="' + e.question.id + '"]').length) {

			// put question at the top of the list of available questions
			$container.prepend(me.templates.notification({
				question: e
			})).find('[rel=tooltip]').tooltip({
				placement: 'right'
			});
		}
	})
};

/**
 * Create a new instance of the video player at the specified container
 *
 */
CS50.Video.prototype.createPlayer = function() {
	// create html for video player
	var $container = $(this.options.playerContainer);
	$container.html(this.templates.player({
		height: this.options.height,
		srt: this.options.srt,
		swf: this.options.swf,
		title: this.options.title,
		video: this.options.video,
		width: this.options.width
	}));

	// create video player
	var me = this;
	this.player = new MediaElementPlayer(this.options.playerContainer + ' .video-player', {
		timerRate: 500,
		success: function (player, dom) {
			// event handler for video moving forward
			player.addEventListener('timeupdate', function(e) {
				// check if a new question is available
				me.checkQuestionAvailable();

				// update highlight on the transcript
				me.updateTranscriptHighlight();
			}, false);

			// start video immediately if autostart is enabled
			if (me.options.autostart)
				player.play();
		}
	});

	// when back button is pressed, return to video
	$container.on('click', '.btn-back', function(e) {
		// hide button
		$(this).fadeOut('medium');

		// start video and flip back
		me.player.play();
		$container.find('.flip-container').removeClass('flipped');

		// remove input
		$('.video50-txt-answer').remove();

		// fade video back in while flip is occurring for smoothness
		setTimeout(function() {
			$container.find('.video-container').fadeIn('medium');
		}, 500);
	});
};

/**
 * Create a new instance of the notification area at the specified container
 *
 */
CS50.Video.prototype.createNotifications = function() {
	// build notifications container
	var $container = $(this.options.notificationsContainer);
	$container.html(this.templates.notifications());

	// event handler for selecting a question to view
	var me = this;
	$container.on('click', 'a', function() {
		// display question
		var id = $(this).parents('[data-question-id]').attr('data-question-id');
		me.showQuestion(id);

		// remove selected question from list
		$(this).tooltip('hide');
		$(this).parents('tr').remove();
	});
};

/**
 * Load the specified SRT file
 *
 */
CS50.Video.prototype.loadSrt = function() {
	this.srtData = {};
	var player = this.player;
	var me = this;

	if (this.options.srt) {
		$.get(this.options.srt, function(response) {
			var timecodes = response.split(/\n\s*\n/);

			// if transcript container is given, then build transcript
			if (me.options.transcriptContainer) {
				$(me.options.transcriptContainer).append(me.templates.transcript());
				var $container = $(me.options.transcriptContainer).find('.video50-transcript');

				// iterate over each timecode
				var n = timecodes.length;
				for (var i = 0; i < n; i++) {
					// split the elements of the timecode
					var timecode = timecodes[i].split("\n");
					if (timecode.length > 1) {
						// extract time and content from timecode
						var timestamp = timecode[1].split(" --> ")[0];
						timecode.splice(0, 2);
						var content = timecode.join(" ");

						// if line starts with >> or [, then start a new line
						if (content.match(/^(>>|\[)/))
							$container.append('<br /><br />');

						// convert from hours:minutes:seconds to seconds
						var time = timestamp.match(/(\d+):(\d+):(\d+)/);
						var seconds = parseInt(time[1], 10) * 3600 + parseInt(time[2], 10) * 60 + parseInt(time[3], 10);

						// add line to transcript
						$container.append('<a href="#" data-time="' + seconds + '">' + content + '</a>');
					}
				}

				// when a line is clicked, seek to that time in the video
				$container.on('click', 'a', function() {
					// determine timecode associated with line
					var time = $(this).attr('data-time');

					if (time)	
						player.setCurrentTime(time);
				});

				// keep track of scroll state so we don't auto-seek the transcript when the user scrolls
				me.disableTranscriptAutoSeek = false;
				$(me.options.transcriptContainer).find('.video50-transcript-container').on('scrollstart', function() {
					me.disableTranscriptAutoSeek = true;
				});
				$(me.options.transcriptContainer).find('.video50-transcript-container').on('scrollstop', function() {
					me.disableTranscriptAutoSeek = false;
				});
			}
		});
	}
};

/**
 * Callback for logging question data
 *
 */
CS50.Video.prototype.renderCallback = function() {
};

/**
 * Show the question with the given ID
 *
 */
CS50.Video.prototype.showQuestion = function(id) {
	// determine question to show
	var question = _.find(this.options.questions, function(e) { return e.question.id == id; });

	if (question) {
		// flip video over to display question
		if (question.mode == CS50.Video.QuestionMode.FLIP) {
			// stop video so we can think, think, thiiiiiink
			this.player.pause();

			// remove existing panel questions
			$('.video50-question .panel-close').click();

			// clear previous question contents and events
			var player = $(this.options.playerContainer);
			var $container = $(this.options.playerContainer).find('.flip-question-container .question-content');
			$container.empty().off();

			// render question
			question.question.render($container, question.question, CS50.Video.renderCallback);

			// flip player to show question
			$(this.options.playerContainer).find('.video-container').fadeOut('medium');
			$(this.options.playerContainer).find('.flip-container').addClass('flipped');

			// display back button
			setTimeout(function() {
				player.find('.btn-back').show();
			}, 100);
		}

		// display question in the specified panel while video plays
		else if (question.mode == CS50.Video.QuestionMode.PANEL) {
			// remove existing flip questions
			$('.video50-player .btn-back').click();

			// clear previous question contents and events
			var $container = $(this.options.questionContainer);
			$container.empty().off();

			// render question
			$container.hide().html(this.templates.panelQuestion()).fadeIn('fast');
			question.question.render($container.find('.question-content'), question.question, CS50.Video.renderCallback);

			// when x in top-right corner is clicked, remove the question
			$container.on('click', '.panel-close', function() {
				$container.find('.video50-question').fadeOut('fast', function() {
					// remove question controls
					$('.video50-txt-answer').remove();
					$(this).remove();
				});
			});
		}
	}
};

/**
 * Highlight the line corresponding to the current point in the video in the transcript
 *
 */
CS50.Video.prototype.updateTranscriptHighlight = function() {
	var time = Math.floor(this.player.getCurrentTime());
	var $container = $(this.options.transcriptContainer);
	var $active = $container.find('[data-time="' + time + '"]');

	// check if a new element should be highlighted
	if ($active && $active.length) {
		// remove all other highlights
		$container.find('a').removeClass('highlight');

		// add highlight to active element
		$active.addClass('highlight');

		// put the current element in the middle of the transcript if user is not scrolling
		if (!this.disableTranscriptAutoSeek) {
			var top = $active.position().top - parseInt($container.height() / 2);
			$container.find('.video50-transcript-container').scrollTop(top);
		}
	}
}