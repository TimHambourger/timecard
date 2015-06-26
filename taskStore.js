var tasks = {},
	currTask = null,
	currTaskStart = null;

exports.tasks = tasks;
exports.startTask = startTask;
exports.endCurrTask = endCurrTask;

function startTask(task, time) {
	// if there's a current task, end it
	if (currTask !== null) endCurrTask(time);
	
	// mark the passed task as the current task
	currTask = task;
	currTaskStart = time;
}

function endCurrTask(time) {
	if (currTask === null) return false;

	// calculate duration from currTaskStart
	var elapsedTime = time.diff(currTaskStart, 'minutes');
	
	// always assume 0 <= elapsedTime < 1 day
	if (elapsedTime < 0) elapsedTime += 24*60;

	// add it to time for current task
	if (!tasks[currTask]) tasks[currTask] = 0;
	tasks[currTask] += elapsedTime;
	
	// null out currTask and currTaskStart
	currTask = null;
	currTaskStart = null;

	return true;
}