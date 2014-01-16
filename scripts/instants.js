var inherit = function(childObj, parentClass) {
    var tmpObj = function () {}
    tmpObj.prototype = parentClass.prototype;
    childObj.prototype = new tmpObj();
    childObj.prototype.constructor = childObj;
};

var SampleInstant = (function () { 
	// This class is used to represent a instant in Simulation Time. 

	var states = {
		PAST: 'past',
		FUTURE: 'future',
	};

	function SampleInstant (sampleTime, zeroTime) {
		
		this.sampleTime = sampleTime;	// this.sampleTime is the cannonical source of simulation time and real time.
		this.zeroTime = zeroTime;		// this.zeroTime is the Sample Time of the earliest event.

		this.timeoutHandle = null;
		this.temporalState = states.FUTURE;
		this.listeners = [];
	}

	SampleInstant.prototype.getDelay = function(sampleTimeSpeedup, simulationTimeOffset) {
		
		// simulationTime is the time of a particular instant within the frame of reference of a simulation. It is 
		// *not* the current time within the simulation.
		var simulationTime = (this.sampleTime - this.zeroTime) / sampleTimeSpeedup;	

		// Similarly, realTime is the wall-time representation of the current instant (not necessarily the same as the 
		// instant tracked by this object). The current real time is given by Date.now().
		var realTime = simulationTime + simulationTimeOffset;

		// delay is the number of milliseconds between the current real time and the real time of a particular instant 
		// (specifically, the instant represented by this Time instance). A negative delay means that the instant 
		// happened in the 'past' (within simulation time, at least).
		var delay = realTime - Date.now();

		return delay;		// delay has units of milliseconds of wall time.
	};

	SampleInstant.prototype.start = function(sampleTimeSpeedup, simulationTimeOffset) {

		this.pause();	// cancel any running timer.

		var delay = this.getDelay(sampleTimeSpeedup, simulationTimeOffset);		// delay has units of milliseconds of wall time.
		this.updateTemporalState(delay);

		if (delay > 0) {	// it's no use setting a timeout if the event happens in the past.
			this.timeoutHandle = window.setTimeout(this.onCountdownFires.bind(this), delay);
		}
	};

	SampleInstant.prototype.pause = function() {

		if (this.timeoutHandle !== null) {
			window.clearTimeout(this.timeoutHandle);
			this.timeoutHandle = null;
		}
	};

	SampleInstant.prototype.scrub = function(sampleTimeSpeedup, simulationTimeOffset) {

		var wasActive = (this.timeoutHandle !== null);
		if (wasActive) {
			this.pause();	// cancel the running timer.
		}
		
		var delay = this.getDelay(sampleTimeSpeedup, simulationTimeOffset);		// delay has units of milliseconds of wall time.
		this.updateTemporalState(delay);

		if (wasActive && (delay > 0)) {	// it's no use setting a timeout if the event happens in the past.
			this.timeoutHandle = window.setTimeout(this.onCountdownFires.bind(this), delay);
		}
	};

	//=== The Inner Processing Layer ===//

	// These would both be private functions if javascript wasn't written in 10 days.

	SampleInstant.prototype.onCountdownFires = function() {

		this.timeoutHandle = null;
		this.updateTemporalState(-1);	// any negative number would do here. 
	}

	SampleInstant.prototype.updateTemporalState = function(delay) {
		
		if ((this.temporalState === states.FUTURE) && (delay <= 0)) {
			// Hey look, the event just happened! (Or at least, it has happened between now and whenever we
			// last checked.)
			
			this.temporalState = states.PAST;
			for (var i=0; i<this.listeners.length; i++) {
				if (this.listeners[i].activate !== undefined) {
					this.listeners[i].activate();
				}
			};
		}
		else if ((this.temporalState === states.PAST) && (delay > 0)) {
			// The event just un-happened! This occurs when the clock is scrubbed to an earlier time.

			this.temporalState = states.FUTURE;
			for (var i=0; i<this.listeners.length; i++) {
				if (this.listeners[i].deactivate !== undefined) {
					this.listeners[i].deactivate();
				}
			};
		}
	};

	//=== The Downstream Interface ===//

	SampleInstant.prototype.registerListener = function(listener) {
		// This is used by Action instances, so that they can be turned on and off based on the time that the Action
		// occured. Each subscriber object should have an activate() function and a deactivate() function.

		this.listeners.push(listener);
	};

	return SampleInstant;
})();

//Validator.call(this);

var ResetInstant = (function () { 
	// This class is used to represent a instant in Simulation Time. 

	var states = {
		PAST: 'past',
		FUTURE: 'future',
	};

	function ResetInstant (sampleTime, zeroTime) {
		
		this.sampleTime = sampleTime;	// this.sampleTime is the cannonical source of simulation time and real time.
		this.zeroTime = zeroTime;		// this.zeroTime is the Sample Time of the earliest event.

		this.timeoutHandle = null;
		this.temporalState = states.FUTURE;
		this.listeners = [];
	}

	ResetInstant.prototype = new SampleInstant();

	ResetInstant.prototype.updateTemporalState = function(delay) {
		
		if ((this.temporalState === states.FUTURE) && (delay <= 0)) {
			// Hey look, the event just happened! (Or at least, it has happened between now and whenever we
			// last checked.)
			
			this.temporalState = states.PAST;
			for (var i=0; i<this.listeners.length; i++) {
				if (this.listeners[i].reset !== undefined) {
					this.listeners[i].reset();
				}
			};
		}
		else if ((this.temporalState === states.PAST) && (delay > 0)) {
			// The event just un-happened! This occurs when the clock is scrubbed to an earlier time.

			this.temporalState = states.FUTURE;
		}
	};

	return ResetInstant;
})();
