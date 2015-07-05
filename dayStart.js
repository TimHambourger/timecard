module.exports = DayStartCalc;

var moment = require('moment');

function DayStartCalc(dayStartStr) {
    // parse dayStart and convert to moment object
    var re = /^(\d\d?)(:\d\d)?(a|p)m?$/,
	matches = re.exec(dayStartStr.toLowerCase());

    if (matches === null) throw new Error('Unparseable dayStart: ' + dayStartStr);

    var hours = matches[1],
        mins = matches[2],
        amPm = matches[3];
    
    this.moment = moment(hours + (mins || ':00') + 'a', 'h:mma');
    this.amPm = amPm;
}

DayStartCalc.prototype.getAmPm = function (timeStr) {
    var time = moment(timeStr + 'a', 'h:mma');
    if (time.isAfter(this.moment)) return this.amPm;
    return this.amPm === 'a' ? 'p' : 'a';
};
