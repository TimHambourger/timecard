module.exports = TaskStore;

function TaskStore() {
    this.tasks = {};
    this._currTask = null;
    this._currTaskStart = null;
}

TaskStore.prototype.startTask = function (task, time) {
    // if there's a current task, end it
    if (this._currTask !== null) this.endCurrTask(time);
	
    // mark the passed task as the current task
    this._currTask = task;
    this._currTaskStart = time;
};

TaskStore.prototype.endCurrTask = function (time) {
    if (this._currTask === null) return false;

    // calculate duration from currTaskStart
    var elapsedTime = time.diff(this._currTaskStart, 'minutes');

    // always assume 0 <= elapsedTime < 1 day
    if (elapsedTime < 0) elapsedTime += 24*60;

    // add it to time for current task
    if (!this.tasks[this._currTask]) this.tasks[this._currTask] = 0;
    this.tasks[this._currTask] += elapsedTime;

    // null out currTask and currTaskStart
    this._currTask = null;
    this._currTaskStart = null;

    return true;
};
