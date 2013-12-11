// There are three measures of time:
//  - Sample Time is the time that the event happened in the real world. Often it's a long time ago.
//  - Simulation Time is the time that the event happens within the simulation. Simulation time often 
//    moves faster than sample time, and it can be paused and scrubbed.
//  - Wall Time is the computer time used to calculate when a javascript event should be triggered.

var Time = (function () { 
	// This class is used to represent a instant in Simulation Time. 

	function Time (sampleTime, zeroTime, clock) {
		
		this.sampleTime = sampleTime;	// this.sampleTime is the cannonical source of simulation time and real time.
		this.zeroTime = zeroTime;		// this.zeroTime is the Sample Time of the earliest event.

		this.clock = clock;
		this.timeout = null;
		this.temporalState = states.FUTURE;
		this.subscribers = [];
	}

	//===== The Upsteam Interface =================================================================================//

	Time.prototype.start = function(sampleTimeSpeedup, simulationTimeOffset) {
		
		this.pause();	// cancel any running timer.

		// simulationTime is the time of a particular instant within the frame of reference of a simulation. It is 
		// *not* the current time within the simulation.
		var simulationTime = (this.sampleTime - this.zeroTime) / sampleTimeSpeedup;	

		// Similarly, realTime is the wall-time representation of a particular instant. The current real time is given 
		// by Date.now().
		var realTime = simulationTime + simulationTimeOffset;

		// delay is the number of milliseconds between the current real time and the real time of a particular instant 
		// (specifically, the instant represented by this Time instance). A negative delay means that the instant 
		// happened in the 'past' (within simulation time, at least).
		var delay = realTime - Date.now();

		this.updateTemporalState(delay);

		if (delay > 0) {	// it's no use setting a timeout if the event happens in the past.
			this.timeoutHandle = window.setTimeout(this.onCountdownFires.bind(this), delay);
		}
	};

	Time.prototype.pause = function() {
		
		if (this.timeoutHandle !== null) {
			window.clearTimeout(this.timeoutHandle);
			this.timeoutHandle = null;
		}
	};

	Time.prototype.scrub = function(sampleTimeSpeedup, simulationTimeOffset) {
		// This is just a wrapper function so that code can be a bit more self-documenting.

		this.start(sampleTimeSpeedup, simulationTimeOffset);
	}

	//===== The Inner Processing Layer ============================================================================//

	// These would all be private functions if javascript wasn't written in 10 days.

	Time.prototype.onCountdownFires = function() {

		this.timeoutHandle = null;
		this.updateTemporalState(-1);	// any negative number would do here. 
	}

	Time.prototype.updateTemporalState = function(delay) {
		
		if ((this.temporalState === states.FUTURE) && (delay <= 0)) {
			// Hey look, the event just happened! (Or at least, it has happened between now and whenever we
			// last checked.)
			
			this.temporalState = states.PAST;
			for (var i=0; i<this.subscribers.length; i++) {
				this.subscribers[i].activate();
			};
		}
		else if ((this.temporalState === states.PAST) && (delay > 0)) {
			// The event just un-happened! This occurs when the clock is scrubbed to an earlier time.

			this.temporalState = states.FUTURE;
			for (var i=0; i<this.subscribers.length; i++) {
				this.subscribers[i].deactivate();
			};
		}
	};

	//===== The Downstream Interface ==============================================================================//

	Time.prototype.subscribe = function(subscriber) {
		// This is used by Action instances, so that they can be turned on and off based on the time that the Action
		// occured. Each subscriber object should have an activate() function and a deactivate() function.

		this.subscribers.push[subscriber];
	};

	return Time;
})();