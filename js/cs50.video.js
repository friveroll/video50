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
	this.options.swf = (options.swf === undefined) ? 'swf/flashmediaelement' : options.swf;
	this.options.title = (options.title === undefined) ? '' : options.title;
	this.options.width = (options.width === undefined) ? 640 : options.width;

	// templates for plugin
	template_html = {
		player: ' \
			<div class="video50-player"> \
				<div class="player-navbar"> \
					<button class="btn btn-back"><i class="icon-arrow-left"></i> Back</button> \
					<div class="player-navbar-title"><%= title %></div> \
				</div> \
				<div class="flip-container"> \
					<div class="video-container" style="width: <%= width %>px; height: <%= height %>px"> \
						<video width="<%= width %>" height="<%= height %>" class="video-player" controls="controls"> \
				            <source type="video/mp4" src="<%= video %>" /> \
							<object width="<%= width %>" height="<%= height %>" type="application/x-shockwave-flash" data="<%= swf %>"> \
						        <param name="movie" value="<%= swf %>" /> \
						        <param name="flashvars" value="controls=true&file=<%= video %>" /> \
						    </object> \
						</video> \
					</div> \
					<div class="flip-question-container video50-question"> \
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
		'
	};

	// compile templates
    this.templates = {};
    for (var template in template_html)
        this.templates[template] = _.template(template_html[template]);

    // instantiate video
	this.createPlayer();
	this.createNotifications();
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
		swf: this.options.swf,
		title: this.options.title,
		video: this.options.video,
		width: this.options.width
	}));

	// create video player
	var me = this;
	this.player = new MediaElementPlayer(this.options.playerContainer + ' .video-player', {
		success: function (player, dom) { 
			player.addEventListener('timeupdate', function(e) {
				me.checkQuestionAvailable();
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

		// fade video back in during flip
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
		// stop video so we can think, think, thiiiiiink
		this.player.pause();

		if (question.mode == 'flip') {
			// clear previous question contents
			var player = $(this.options.playerContainer);
			var $container = $(this.options.playerContainer).find('.flip-question-container .question-content');
			$container.empty();

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
	}
};