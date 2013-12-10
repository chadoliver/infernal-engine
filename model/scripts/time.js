// There are three measures of time:
//  - Sample Time is the time that the event happened in the real world. Often it's a long time ago.
//  - Simulation Time is the time that the event happens within the simulation. Simulation time often 
//    moves faster than sample time, and it can be paused and scrubbed.
//  - Wall Time is the computer time used to calculate when a javascript event should be triggered.

var Countdown = (function () {

	
	
})();

var Time = (function () { 
	// This class is used to represent a instant in Simulation Time. 

	function Time (sampleTime, zeroTime, speedup, clock) {

		
		
		
		// this.sampleTime is the cannonical source of simulation time and real time. We assume that it 
		// doesn't change, since it is initially read in from a static file.
		this.sampleTime = sampleTime;

		// this.zeroTime is the Sample Time of the earliest event. That event has a Simulation Time of zero, 
		// and it is the datum against which all other Simulation Times are measured.
		this.zeroTime = zeroTime;

		// this.speedup is the degree to which Simulation Time runs faster than Sample Time. A speedup of 3
		// means that 3 Sample seconds are equivalent to 1 Simulation second.
		this.speedup = speedup;

		// The instance listens to PAUSE and START events on the upstream source (this.simulationClock), and
		// it generates IS_ACTIVE and IS_INACTIVE events for downstream sinks (this.subscribers).
		this.simulationClock = clock;
		this.state = states.PENDING;
		this.subscribers = [];
		this.timeoutHandle = null;

	}

	Time.prototype.cancelCountdown = function(first_argument) {
		
		if (this.timeoutHandle !== null) {
			window.clearTimeout(this.timeoutHandle);
		}
	};

	Time.prototype.startCountdown = function(sampleTimeSpeedup, simulationTimeOffset) {
		// body...
	};



	Time.prototype.subscribe = function(callback) {
		// this is used by Person instances, so that they can be notified when 'their' Time instances
		// are triggered.

		this.subscribers.push[callback];
	};

	Time.prototype.setState = function(state) {
		this.state = state;
		for (var i; i<this.subscribers.length; i++) {
			this.subscribers[i](state);
		}
	};

	Time.prototype.getRealTime = function() {
		
		var simulationTime = (this.sampleTime - this.zeroTime) / this.speedup;
		var realTime = simulationTime + this.simulationClock.getOffset();

	};

	return Time;
})();