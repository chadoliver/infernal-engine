// Stopwatch is a class which is used to measure execution time.

var Stopwatch = (function () {

	var states = {
		PAUSED: 'paused',
		ACTIVE: 'active',
	};
	
	function Stopwatch (message) {
		this.ticks = 0;
		this.timeWhenActivated = null;	
		this.state = states.PAUSED;

		if (message !== undefined) console.log(message);
	}

	Stopwatch.prototype.start = function(message) {
		if (this.state !== states.ACTIVE) {
			this.timeWhenActivated = Date.now();
			this.state = states.ACTIVE;
		}
		if (message !== undefined) console.log(this.getTime(), message);
		return this;
	};

	Stopwatch.prototype.pause = function(message) {
		if (this.state !== states.PAUSED) {
			var runTime = Date.now(); - this.timeWhenActivated;
			this.ticks += runTime;
			this.timeWhenActivated = null;
		}
		if (message !== undefined) console.log(this.getTime(), message);
		return this;
	};

	Stopwatch.prototype.stop = function(message) {		
		return this.pause(message);	// Stopwatch.stop() is just an alias for Stopwatch.pause();
	};

	Stopwatch.prototype.reset = function(message) {
		this.pause(message);
		this.ticks = 0;
		return this;
	};

	Stopwatch.prototype.getTicks = function() {
		// get the current time, without stopping the clock.
		if (this.state === states.ACTIVE) {
			return this.ticks + (Date.now() - this.timeWhenActivated);
		} else {
			return this.ticks;
		}
	}

	Stopwatch.prototype.getTime = function() {

		var remainder = this.getTicks();

		var milliseconds = remainder % 1000;
		remainder = Math.floor(remainder / 1000);

		var seconds = remainder % 60;
		remainder = Math.floor(remainder / 60);

		var minutes = remainder % 60;
		remainder = Math.floor(remainder / 60);

		var hours = remainder;

		var message = "";
		if (hours) message += hours + "h ";
		if (minutes) message += minutes + "m ";
		if (seconds) message += seconds + "s ";
		if (milliseconds) message += milliseconds + "ms  ";

		return message
	};

	return Stopwatch;
})();