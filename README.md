This is CS50 Video.
---

Video50 is an extensible video player that allows a variety of question types to be embedded at specific timecodes and supports multi-language transcripts.

## Player

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
        video: [
            { type: 'mp4', url: 'http://cdn.cs50.net/2011/fall/lectures/0/week0w.mp4?download' }
        ]
    });

The options object passed to the `CS50.Video` constructor can define the following keys:

* `autostart`: True to start video automatically, false otherwise.
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
* `video`: List containing objects defining a video `type` (e.g., 'mp4') and `url`.
* `width`: Width of video player (in pixels).

Of these keys, `playerContainer` and `video` are required.

## Questions

A question is represented by an object with the following required keys:

* `mode`: Question display mode (i.e., flip the video container, display question in a separate panel, etc.).
* `timecode`: Second of video at which question should become available.
* `question`: Object representing the question to be displayed. This object must contain at least an `id` representing the unique identifier for the question, a `render` function that will be called in order to display the question, and an array of `tags` that describe the topics covered by the question. Information specific to a question type, such as a `question` and an `answer`, must also be defined in this object.

Questions are created using a question rendering method. A question rendering method will be passed three parameters from the `CS50.Video` object:

* `container`: The container to render the question within.
* `data`: An object containing the data necessary to display the question.
* `callback`: A callback function that must be called when the question is answered, for server-side logging purposes.

### Existing Question Types

Video50 ships with support for several common question types.

#### Free-Response
`CS50.Video.Render.FreeResponse`

A question allowing the user to answer via a text box. The following keys must be defined:

* `answer`: A regular expression matching a correct answer.
* `question`: The text of the question.

#### Multiple-Choice
`CS50.Video.Render.MultipleChoice`

A question allowing the user to answer by selecting from a list of choices. The following keys must be defined:

* `answer`: The index of the correct answer.
* `choices`: Array of choices to be displayed to the user.
* `question`: The text of the question.

#### Numeric
`CS50.Video.Render.Numeric`

A question allowing the user to input a number via a text box. The following keys must be defined:

* `answer`: Numerical answer to the question.
* `question`: The text of the question.
* `tolerance`: Uncertainty value for the answer. For example, a tolerance value of `0.1` will accept all answers that are within 10% of the specified answer.

#### True/False
`CS50.Video.TrueFase`

A question allowing the user to select "true" or "false". The following keys must be defined:

* `answer`: Boolean value representing the correct answer.
* `question`: The text of the question.
