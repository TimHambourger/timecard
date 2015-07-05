#!/usr/bin/env node

var TimeCard = require('./timecard');

// round to nearest 15 minutes
var rounding = 'all',
    roundTo = 15;


var timecard = new TimeCard({
    rounding: rounding,
    roundTo: roundTo
});

timecard.readStream(process.stdin, function (err) {
    if (err) throw err;
    timecard.writeStream(process.stdout);
});
