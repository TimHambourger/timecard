#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    TimeCard = require('./timecard'),
    PrefStore = require('./prefStore'),
    argConverter = require('./argConverter'),
    argv = require('yargs')
        .boolean('config')
        .boolean('delete')
        .boolean('totalsOnly')
        .boolean('stdin')
        .alias('d', 'delete')
        .alias('T', 'totalsOnly')
        .argv;

new PrefStore(function (err, prefs) {

    if (err) throw err;

    if (argv.config) {
        var params = argv._;
        // TODO: Better usage message.
        if (params.length === 0) throw new Error('Must specify a config key');
        var key = params[0];
        if (argv['delete']) prefs.remove(key);
        else if (params.length > 1) prefs.write(key, params[1]);
        else console.log(prefs.read(key) || '');
        return;
    }

    var dayStart = argv.dayStart || prefs.read('dayStart'),
        rounding = argv.rounding || prefs.read('rounding'),
        roundTo = (argv.roundTo !== undefined) ? argv.roundTo : prefs.read('roundTo'),
        totalsOnly = argv.totalsOnly;

    if (roundTo !== undefined) roundTo = argConverter.parseInt(roundTo, function () {
        throw new Error('Unable to parse roundTo option with value \'' + roundTo + '\'. Must be an integer.');
    });
    
    var files = argv.stdin ? ['dummy'] : argv._,
        multiFile = files.length > 1,
        i = 0;
    
    processNext();
    
    function processNext() {
        if (i >= files.length) return;
    
        var file = files[i++],
            timecard = new TimeCard({
                dayStart: dayStart,
                rounding: rounding,
                roundTo: roundTo,
                totalsOnly: totalsOnly
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

});
