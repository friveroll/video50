// maintain compatibility with other CS50 libraries
var CS50 = CS50 || {};
CS50.Video.Render = CS50.Video.Render || {};

/**
 * Check an answer via the remote server
 *
 * @param question Question being answered
 * @param answer Student's selected answer
 *
 */
CS50.Video.Render.checkRemote = function(question, answer, video, callback) {
    // make sure check url is defined
    if (!video.options.checkUrl)
        throw 'Error: A check URL must be defined!';

    // send answer to server
    var me = this;
    $.ajax({
        dataType: 'jsonp',
        url: video.options.checkUrl,
        data: { 
            id: question.id,
            answer: answer
        }, 
        success: function(response) {
            // inform the user if the response was correct
            me.displayCorrectness(response.correct, video);

            // finish with this question
            callback.call(video, question.id, response.correct, {});
        }
    });
};

/**
 * Display a message informing the user if their answer was correct
 *
 * @param correct Whether or not the user was correct
 * @param video Video player
 * @param $container Container to display alert within
 *
 */
CS50.Video.Render.displayCorrectness = function(correct, video, $container) {
    // if no container given, add to player
    if ($container === undefined)
        $container = $(video.options.playerContainer).find('.question-content');

    // remove previous messages from the container
    $container.find('.alert').remove();

    // display message depending on correctness of answer
    if (correct)
        var $message = $('<div class="alert alert-success"><strong>Correct!</strong></div>');       
    else
        var $message = $('<div class="alert alert-error">That\'s not the right answer, <strong>try again!</strong></div>');

    // display message
    $message.hide().appendTo($container).fadeIn('fast');
}

/**
 * Renderer for a multiple choice question
 *
 * @param video Video player object
 * @param container Container for question to be rendered within
 * @param data Question data
 * @param callback Response callback
 * @return Input element user types into
 * @param remote Whether or not the question is checked remotely, defaults to true
 *
 */
CS50.Video.Render.FreeResponse = function(video, container, data, callback, remote) {
    // render question and input area placeholder
    var $container = $(container);
    $container.append('<h2>' + data.question + '</h2>');
    var $placeholder = $('<input type="text" class="txt-answer-location" />');
    $container.append($placeholder);

    // create input area that is absolutely positioned to avoid transform weirdness
    var $input = $('<input type="text" class="video50-txt-answer" />');
    setTimeout(function() {
        var offset = $placeholder.offset();
        $input.css({ position: 'absolute', 'top': offset.top + 'px', 'left': offset.left + 'px', 'z-index': 999 });
        $('body').append($input);
        $placeholder.css({ visibility: 'hidden' });
    }, 1000);

    // create submit button, hidden by default
    var $submit = $('<button class="btn btn-submit">Submit Response</button>').hide();
    $container.append($submit);

    // when submit button is pressed, check the answer
    var me = this;
    $container.on('click', '.btn-submit', function(e) {
        // local question
        if (remote === undefined || remote === false) {
            // a correct answer matches the supplied regex
            var correct = $input.val().match(data.answer);
            me.displayCorrectness(correct, video);

            // finish this question
            callback.call(video, data.id, correct, {});
        }

        // remote question
        else
            me.checkRemote(data, $input.val(), video, callback);

        e.preventDefault();
        return false;
    });

    // when answer is selected, make sure submit button is shown
    $('body').on('keyup', '.video50-txt-answer', function(e) {
        var $submit = $container.find('.btn-submit');
        var $input = $('.video50-txt-answer');

        // toggle submit button based on input state
        if ($input.val().match(/^\s*$/) && $submit.is(':visible'))
            $submit.fadeOut('fast');
        else if (!$submit.is(':visible'))
            $submit.fadeIn('fast');

        e.stopPropagation();
    });

    return $input;
};

/**
 * Renderer for a remote free response question
 *
 * @param video Video player object
 * @param container Container for question to be rendered within
 * @param data Question data
 * @param callback Response callback
 *
 */
CS50.Video.Render.FreeResponseRemote = function(video, container, data, callback) {
    CS50.Video.Render.FreeResponse(video, container, data, callback, true);
};

/**
 * Renderer for a multiple choice question
 *
 * @param video Video player object
 * @param container Container for question to be rendered within
 * @param data Question data
 * @param callback Response callback
 * @param remote Whether or not the question is checked remotely, defaults to true
 *
 */
CS50.Video.Render.MultipleChoice = function(video, container, data, callback, remote) {
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
    var me = this;
    $container.on('click', '.btn-submit', function(e) {
        // local question
        if (remote === undefined || remote === false) {
            // the index of the selected answer must match the correct answer
            var correct = (data.answer == $container.find('input[type=radio]:checked').val());
            me.displayCorrectness(correct, video);

            // finish this question
            callback.call(video, data.id, correct, {});
        }

        // remote question
        else
            me.checkRemote(data, $container.find('input[type=radio]:checked').val(), video, callback);

        e.preventDefault();
        return false;
    });

    // when answer is selected, make sure submit button is shown
    $container.on('click', '.question-choices input[type=radio]', function() {
        $submit = $container.find('.btn-submit');
        if (!$submit.is(':visible')) {
            $submit.fadeIn('fast');
        }
    });
};

/**
 * Renderer for a remote multiple choice question
 *
 * @param video Video player object
 * @param container Container for question to be rendered within
 * @param data Question data
 * @param callback Response callback
 *
 */
CS50.Video.Render.MultipleChoiceRemote = function(video, container, data, callback) {
    CS50.Video.Render.MultipleChoice(video, container, data, callback, true);
};

/**
 * Renderer for a question with a numeric answer
 *
 * @param video Video player object
 * @param container Container for question to be rendered within
 * @param data Question data
 * @param callback Response callback 
 * @param remote Whether or not the question is checked remotely, defaults to true
 *
 */
CS50.Video.Render.Numeric = function(video, container, data, callback, remote) {
    // if no tolerance given, then assume exact answer
    data.tolerance = (data.tolerance === undefined) ? 1 : data.tolerance;

    // render free response
    var $input = CS50.Video.Render.FreeResponse(video, container, data, callback);

    // swap out event handler
    var $container = $(container);
    $container.off('click', '.btn-submit');

    // when submit is pressed, check answer
    var me = this;
    $container.on('click', '.btn-submit', function(e) {
        // make sure answer is given as a float
        var val = parseFloat($input.val());

        // local question
        if (remote === undefined || remote === false) {
            var correct = (!isNaN(val) && val <= data.answer + data.answer * data.tolerance && 
                val >= data.answer - data.answer * data.tolerance);
            me.displayCorrectness(correct, video);

            // finish this question
            callback.call(video, data.id, correct, {});
        }

        // remote question
        else
            me.checkRemote(data, val, video, callback);

        e.preventDefault();
        return false;
    });
};

/**
 * Renderer for a remote numeric question
 *
 * @param video Video player object
 * @param container Container for question to be rendered within
 * @param data Question data
 * @param callback Response callback
 *
 */
CS50.Video.Render.NumericRemote = function(video, container, data, callback) {
    CS50.Video.Render.Numeric(video, container, data, callback, true);
};

/**
 * Renderer for a true/false question
 *
 * @param video Video player object
 * @param container Container for question to be rendered within
 * @param data Question data
 * @param callback Response callback
 * @param remote Whether or not the question is checked remotely, defaults to true
 *
 */
CS50.Video.Render.TrueFalse = function(video, container, data, callback, remote) {
    // true/false is really just multiple choice
    CS50.Video.Render.MultipleChoice(video, container, {
        answer: !data.answer,
        choices: ['True', 'False'],
        id: data.id,
        question: data.question,
        tags: data.tags,
    }, callback, remote);
};

/**
 * Renderer for a remote true/false question
 *
 * @param video Video player object
 * @param container Container for question to be rendered within
 * @param data Question data
 * @param callback Response callback
 *
 */
CS50.Video.Render.TrueFalseRemote = function(video, container, data, callback) {
    CS50.Video.Render.TrueFalse(video, container, data, callback, true);
};
