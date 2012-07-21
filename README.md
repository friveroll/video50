This is CS50 Video.
---

Video50 is an extensible video player that allows a variety of question types to be embedded at specific timecodes and supports transcripts for multiple languages.

# Player

To create a new CS50 Video player, instantiate a new `CS50.Video` object:

    var player = new CS50.Video({
        autostart: true,
        notificationsContainer: '#questions',
        playerContainer: '#video',
        questions: questions,
        questionContainer: '#question',
        srt: {
            'en': 'week0w-en.srt',
            'pt': 'week0w-pt.srt'
        },
        title: 'Lecture 0: Wednesday',
        transcriptContainer: '#transcript',
        video: 'http://cdn.cs50.net/2011/fall/lectures/0/week0w.mp4?download'
    });

The options object passed to the `CS50.Video` constructor can define the following keys:

* `autostart`: True to start video automatically, false for video to start when user clicks play.
* `defaultLanguage`: Default language for transcript and subtitles.
* `height`: Height of video player (in pixels).
* `playbackContainer`: Container to render playback controls within.
* `playbackRates`: List of supported playback rates.
* `playerContainer`: Container to render player within.
* `notificationsContainer`: Container to display question list within.
* `questionContainer`: Container to render question panel within.
* `questions`: List of questions to be displayed during video.
* `srt`: Object mapping languages to SRT file locations.
* `swf`: SWF file to fall back on for unsupported browsers.
* `title`: Title of Video.
* `transcriptContainer`: Container to render transcript within.
* `video`: URL of the video to play.
* `width`: Width of video player (in pixels).

Of these keys, `playerContainer` and `video` are required.

# Questions

A question is represented by an object with the following required keys:

* `mode`: Question display mode (i.e., flip the video container, display question in a separate panel, etc.).
* `timecode`: Second of the video at which question should become available.
* `question`: Object representing the question to be displayed. This object must contain at least an `id` representing the unique identifier for the question, a `render` function that will be called in order to display the question, and an array of `tags` that describe the topics covered by the question. Information specific to a question type, such as a `question` and an `answer`, must also be defined in this object.

Questions are displayed to the user via a question rendering method. A question rendering method will be passed three parameters from the `CS50.Video` object:

* `container`: The container to render the question within.
* `data`: An object containing the data necessary to display the question.
* `callback`: A callback function that must be called when the question is answered, for server-side logging purposes.

The question renderer is then responsible for manipulating the DOM to allow users to interact with the question and informing them whether or not their answer is correct. To create a new question type, simply define a new rendering method and set that method as the `render` parameter in the question object. Check out the existing question types for examples.

## Existing Question Types

Video50 ships with support for several common question types.

### Free-Response

Defined by `CS50.Video.Render.FreeResponse`

A question allowing the user input text into a text box. The following keys must be defined:

* `answer`: A regular expression matching a correct answer.
* `question`: The text of the question.

### Multiple-Choice

Defined by `CS50.Video.Render.MultipleChoice`

A question allowing the user to select from a list of choices. The following keys must be defined:

* `answer`: The index of the correct answer.
* `choices`: Array of choices to be displayed to the user.
* `question`: The text of the question.

### Numeric

Defined by `CS50.Video.Render.Numeric`

A question allowing the user to input a number into a text box. The following keys must be defined:

* `answer`: Numerical answer to the question.
* `question`: The text of the question.
* `tolerance`: Uncertainty value for the answer. For example, a tolerance value of `0.1` will accept all answers that are within 10% of the specified answer.

### True/False

Defined by `CS50.Video.TrueFalse`

A question allowing the user to select "true" or "false". The following keys must be defined:

* `answer`: Boolean value representing the correct answer.
* `question`: The text of the question.

# Known Issues

* Video player only supports the latest versions of Chrome and Firefox. A JavaScript-only fallback to replace the player flip must be introduced for compatibility with other browsers.
