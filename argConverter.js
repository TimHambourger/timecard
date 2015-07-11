exports.parseBool = function (val, cb) {
    if (val.toLowerCase) val = val.toLowerCase();
    if (val.trim) val = val.trim();
    if (val === true || val === 'true' || val === 'yes') return true;
    if (val === false || val === 'false' || val === 'no') return false;
    if (cb) return cb();
    return undefined;
};

exports.parseInt = function (val, cb) {
    var match = /^\s*(\d+)\s*$/.exec(val);
    if (match) return parseInt(match[1]);
    if (cb) return cb();
    return undefined;
};
