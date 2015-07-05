module.exports = TimeCard;

var split = require('split'),
    moment = require('moment'),
    TaskStore = require('./taskStore'),
    Rounder = require('./rounder');

function TimeCard (opts) {
    this.dayStart = opts.dayStart;
    this.taskStore = new TaskStore();
    this.rounder = new Rounder(opts.rounding, opts.roundTo)
}

TimeCard.prototype.readStream = function (stream, cb) {
    stream.pipe(split())
        .on('data', this.readLine.bind(this))
        .on('end', cb)
        .on('error', cb);
}

TimeCard.prototype.readString = function (str) {
    var lines = str.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++)
        this.readLine(lines[i]);
}

TimeCard.prototype.readLine = function (line) {
    // ignore empty lines and commented lines beginning with #
    if (!line.trim() || line[0] === '#') return;

    // regex to match lines of the form
    //   {time} {in|out} [{task name}]
    //
    // e.g.
    //   10:30am in styling
    // OR
    //   1:30 out
    //
    // Time has format [h]h[:mm][am|pm]
    // If minutes are not provided, assumed to be ':00'.
    // If am/pm is not provided, time is assumed to be between 7am and 6:59pm.
    // Also, am/pm can be shorted to a/p, and can be capitalized too
    var re = /^(\d\d?)(:\d\d)?(am?|pm?)?\s+(in|out)(?:\s+(.*))?$/i,
        matches = re.exec(line.trim());

    if (matches === null) throw new Error('Unparseable line:\n' + line);

    var hours = matches[1],
        mins = matches[2],
        amPm = matches[3],
        inOut = matches[4],
        rawTask = matches[5];

    // time parsing...

    var timeString = hours;

    // 1) minutes are options
    timeString += mins || ':00';

    // 2) am/pm is optional. If not provided, assume 12:00 - 6:59 is pm and 7 - 11:59 is am.
    var hoursInt = parseInt(hours);

    timeString += amPm || ((hoursInt < 7 || hoursInt === 12) ? 'pm' : 'am');

    var time = moment(timeString, 'h:mma'),
        isTaskStart = inOut.toLowerCase() === 'in',
        task = rawTask || '';

    if (isTaskStart) {
        this.taskStore.startTask(task, time);
    } else if (!this.taskStore.endCurrTask(time)) {
        throw new Error('Encountered out without matching in:\n' + line);
    }
}

TimeCard.prototype.writeStream = TimeCard.prototype._writeWriteable = function (stream) {
    var roundedTasks = this.rounder.roundTasks(this.taskStore.tasks);
    for (var task in roundedTasks)
        stream.write(formatTime(roundedTasks[task]) + ' -- ' + (task || '(default)') + '\n');
    stream.write('\n');

    var total = 0;
    for (var task in roundedTasks) total += roundedTasks[task];
    stream.write(formatTime(total) + ' -- TOTAL\n');
}

TimeCard.prototype.writeString = function () {
    var writeable = new StringWriteable();
    this._writeWriteable(writeable);
    return writeable.contents;
}

function formatTime(mins) {
    return mins / 60 + '';
}

function StringWriteable() {
    this.contents = '';
}

StringWriteable.prototype.write = function (val) {
    this.contents += val;
}
