#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    TimeCard = require('./timecard'),
    argv = require('yargs')
        .boolean('totalsOnly')
        .alias('T', 'totalsOnly')
        .argv;

// round to nearest 15 minutes
var rounding = 'all',
    roundTo = 15;

var files = argv._,
    multiFile = files.length > 1;

for (var i = 0; i < files.length; i++) {

    var _file = files[i],
        _timecard = new TimeCard({
            rounding: rounding,
            roundTo: roundTo,
            totalsOnly: argv.totalsOnly
        });

    (function (file, timecard) {
        timecard.readStream(fs.createReadStream(file, { encoding: 'utf-8' }), function (err) {
            if (err) throw err;
            if (multiFile) console.log('\n' + path.resolve(file));
            timecard.writeStream(process.stdout);
        });
   })(_file, _timecard); 
}
