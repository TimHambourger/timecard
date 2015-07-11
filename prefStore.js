module.exports = PrefStore;

var fs = require('fs'),
    path = require('path'),
    objectAssign = require('object-assign'),
    argConverter = require('./argConverter');

var home = process.env.HOME || process.env.USERPROFILE;
    prefsPath = path.resolve(home, './.timecard_prefs'),
    loadingErrorMsg = 'Cannot read or write prefs until PrefStore has loaded. Uses the constructor callback parameter.';

function PrefStore(cb) {
    var prefs = this;

    fs.readFile(prefsPath, {
        encoding: 'utf8'
    }, function (err, data) {
        if (err) {
            if (err.code === 'ENOENT') {
                prefs._prefsObj = {};
            } else {
                cb(err);
                return;
            }
        } else {
            try {
                prefs._prefsObj = JSON.parse(data);
            } catch (e) {
                var msg = 'Corrupt prefs file \'' + prefsPath + '\'. Could not parse as JSON.';
                cb(new Error(msg));
                return;
            }
        }
        cb(null, prefs);
    });

}

PrefStore.prototype.readString = function (key, cb) {
    if (!this._prefsObj) throw new Error(loadingErrorMsg);
    var val = this._prefsObj[key];
    if (val === undefined && cb)
        return cb(getKeyNotFoundError(key));
    return val;
};

PrefStore.prototype.readBool = function (key, cb) {
    if (!this._prefsObj) throw new Error(loadingErrorMsg);
    var val = this._prefsObj[key];
    if (val === undefined) {
        if (cb) return cb(getKeyNotFoundError(key));
        return undefined;
    }
    return argConverter.parseBool(val, function () {
        return cb(getUnparseableValueError(key, val));
    });
};

PrefStore.prototype.readInt = function (key, cb) {
    if (!this._prefsObj) throw new Error(loadingErrorMsg);
    var val = this._prefsObj[key];
    if (val === undefined) {
        if (cb) return cb(getKeyNotFoundError(key));
        return undefined;
    }
    return argConverter.parseInt(val, function () {
        return cb(getUnparseableValueError(key, val));
    });
};

PrefStore.prototype.write = function (key, val, cb) {
    if (!this._prefsObj) throw new Error(loadingErrorMsg);
    var newPrefs = objectAssign({}, this._prefsObj);
    // NOTE: We write all values as strings. We handle converting to the correct type on read.
    newPrefs[key] = val.toString();

    this._writePrefsObj(newPrefs, cb);
};

PrefStore.prototype.remove = function (key, cb) {
    if (!this._prefsObj) throw new Error(loadingErrorMsg);
    var newPrefs = objectAssign({}, this._prefsObj);
    delete newPrefs[key];

    this._writePrefsObj(newPrefs, cb);
};

PrefStore.prototype._writePrefsObj = function (newPrefs, cb) {

    fs.writeFile(prefsPath, JSON.stringify(newPrefs, null, 2), function (err) {
        if (err) {
            if (cb) {
                cb(err);
                return;
            }
            throw err;
        }
        this._prefsObj = newPrefs;
        if (cb) cb();
    });

};

PrefStore.ReadFailure = {
    KeyNotFound: 'KEY NOT FOUND',
    UnparseableValue: 'UNPARSEABLE VALUE'
};

function getKeyNotFoundError(key) {
    return new PrefReadError(PrefStore.ReadFailure.KeyNotFound, 'Could not find a preference with key \'' + key + '\'.');
}

function getUnparseableValueError(key, val) {
    return new PrefReadError(PrefStore.ReadFailure.UnparseableValue, 'Could not parse the value \'' + val
        + '\' for key \'' + key + '\'.');
}

function PrefReadError(failureType, details) {
    this.name = 'PrefReadError';
    this.readFailure = failureType;
    this.message = failureType + ': ' + details;
}

PrefReadError.prototype = Object.create(Error.prototype);
PrefReadError.prototype.constructor = PrefReadError;
