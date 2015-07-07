#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    TimeCard = require('./timecard'),
    argv = require('yargs')
        .boolean('totalsOnly')
        .boolean('stdin')
        .alias('T', 'totalsOnly')
        .argv;

// round to nearest 15 minutes
var rounding = 'all',
    roundTo = 15;

var files = argv.stdin ? ['dummy'] : argv._,
    multiFile = files.length > 1,
    i = 0;

processNext();

function processNext() {
    if (i >= files.length) return;

    var file = files[i++],
        timecard = new TimeCard({
            rounding: rounding,
            roundTo: roundTo,
            totalsOnly: argv.totalsOnly
        }),
        stream = argv.stdin ? process.stdin
            : fs.createReadStream(file, { encoding: 'utf-8' }); 

    timecard.readStream(stream, function (err) {
        if (err) throw err;
        if (multiFile) console.log('\n' + path.resolve(file));
        timecard.writeStream(process.stdout);
        processNext();
    });
}
