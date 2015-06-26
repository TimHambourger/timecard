#!/usr/bin/env node

var split = require('split'),
	moment = require('moment'),
	taskStore = require('./taskStore'),
	roundTasks = require('./rounder');

// round to nearest 15 minutes
var roundTo = 15;

process.stdin.pipe(split())
	.on('data', parseLine)
	.on('end', printOutput);

function parseLine(line) {
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
		taskStore.startTask(task, time);
	} else if (!taskStore.endCurrTask(time)) {
		throw new Error('Encountered out without matching in:\n' + line);
	}
}

function printOutput() {
	var roundedTasks = roundTasks(taskStore.tasks, roundTo);
	for (var task in roundedTasks)
		console.log(formatTime(roundedTasks[task]) + ' -- ' + (task || '(default)'));
	console.log('');

	var total = 0;
	for (var task in roundedTasks) total += roundedTasks[task];
	console.log(formatTime(total) + ' -- TOTAL');
}

function formatTime(mins) {
	return mins / 60 + '';
}
