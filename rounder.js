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

    if (this.rounding !== Strategies.all) throw new Error('Unrecognized rounding value: \'' + this.rounding + '\'.');

    // The difficult case. Adjust the rounded tasks so that the total of the adjusted times is the same as rounding the true total.

    // First compare the rounded true total and the total of the rounded times and assess which direction we need to adjust in.
    var trueTotal = 0;
    for (var task in tasks)
        trueTotal += tasks[task];

    var roundedTotal = this.round(trueTotal);

    var roundedTasksTotal = 0;
    for (var task in tasks)
        roundedTasksTotal += roundedTasks[task];

    var roundingError = roundedTotal - roundedTasksTotal;
    if (roundingError === 0) return roundedTasks;

    // Now sort tasks by those whose true time is farthest from their rounded time.
    // We'll adjust these tasks first.
    var tasksByRoundingError = [];
    for (var task in tasks) {
        tasksByRoundingError.push(task);
    }

    var multiplier = roundingError > 0 ? 1 : -1;

    // Perform the sort, respecting the multiplier and putting the tasks that most need adjusting first.
    tasksByRoundingError.sort(function (taskA, taskB) {
        return multiplier * (tasks[taskB] - roundedTasks[taskB] + roundedTasks[taskA] - tasks[taskA]);
    });

    var adjustedTasks = {};
    for (var task in tasks) {
        adjustedTasks[task] = roundedTasks[task];
    }

    var i = 0; 

    // Keep adjusting till we eliminate the rounding error.
    while (roundingError !== 0) {
        adjustedTasks[tasksByRoundingError[i++]] += this.roundTo * multiplier;
        roundingError -= this.roundTo * multiplier;
    }

    return adjustedTasks;
};

// round mins to nearest available increment
Rounder.prototype.round = function (mins) {
    return Math.round(mins / this.roundTo) * this.roundTo;
};
