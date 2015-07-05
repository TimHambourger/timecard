module.exports = Rounder;

var Strategies = {
    none: 'none', // no rounding
    each: 'each', // round each task individually
    all: 'all' // round all tasks so that rounded total approximates true total
};

function Rounder(rounding, roundTo) {
    this.rounding = rounding;
    this.roundTo = roundTo;
}

Rounder.prototype.roundTasks = function (tasks) {
    if (this.rounding === Strategies.none) return tasks;

    var roundedTasks = {};
    for (var task in tasks)
        roundedTasks[task] = this.round(tasks[task]);

    if (this.rounding === Strategies.each) return roundedTasks;

    var trueTotal = 0;
    for (var task in tasks)
        trueTotal += tasks[task];

    var roundedTotal = this.round(trueTotal);

    var roundedTasksTotal = 0;
    for (var task in tasks)
        roundedTasksTotal += roundedTasks[task];

    var roundingError = roundedTotal - roundedTasksTotal;
    if (roundingError === 0) return roundedTasks;

    var adjustedTasks = {};
    for (var task in tasks) {
        adjustedTasks[task] = roundedTasks[task];
    }

    while (roundingError !== 0) {
        var multiplier = roundingError > 0 ? 1 : -1,
            biggestError = 0,
            biggestErrorTask = null;

        for (var task in tasks) {
            var error = tasks[task] - adjustedTasks[task];
            if (error * multiplier > biggestError * multiplier) {
                biggestError = error;
                biggestErrorTask = task;
            }
        }
        adjustedTasks[biggestErrorTask] += this.roundTo * multiplier;
        roundingError -= this.roundTo * multiplier;
    }

    return adjustedTasks;
};

// round mins to nearest available increment
Rounder.prototype.round = function (mins) {
    return Math.round(mins / this.roundTo) * this.roundTo;
};
