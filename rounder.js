module.exports = roundTasks;

function roundTasks(tasks, roundTo) {
	var trueTotal = 0;
	for (var task in tasks)
		trueTotal += tasks[task];

	var roundedTotal = round(trueTotal, roundTo);

	var roundedTasks = {};
	for (var task in tasks)
		roundedTasks[task] = round(tasks[task], roundTo);

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
		adjustedTasks[biggestErrorTask] += roundTo * multiplier;
		roundingError -= roundTo * multiplier;
	}

	return adjustedTasks;
}

// round mins to nearest available increment
function round(mins, roundTo) {
	return Math.round(mins / roundTo) * roundTo;
}