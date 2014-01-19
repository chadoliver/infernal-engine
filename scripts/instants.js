var inherit = function(childObj, parentClass) {
    var tmpObj = function () {}
    tmpObj.prototype = parentClass.prototype;
    childObj.prototype = new tmpObj();
    childObj.prototype.constructor = childObj;
};

var SampleInstant = (function () { 
	// This class is used to represent a instant in Simulation Time. 

	function SampleInstant (sampleTime, zeroTime) {
		
		this.sampleTime = sampleTime;	// this.sampleTime is the cannonical source of simulation time and real time.
		this.zeroTime = zeroTime;		// this.zeroTime is the Sample Time of the earliest event.

		this.timeoutHandle = null;
		this.isActive = false;
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
		this.notifyListeners(delay);

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
		this.notifyListeners(delay);

		if (wasActive && (delay > 0)) {	// it's no use setting a timeout if the event happens in the past.
			this.timeoutHandle = window.setTimeout(this.onCountdownFires.bind(this), delay);
		}
	};

	//=== The Inner Processing Layer ===//

	// These would both be private functions if javascript wasn't written in 10 days.

	SampleInstant.prototype.onCountdownFires = function() {

		this.timeoutHandle = null;
		this.notifyListeners(-1);	// any negative number would do here. 
	}

	SampleInstant.prototype.notifyListeners = function(delay) {

		var transitionedToActive = (!this.isActive) && (delay <= 0);
		var transitionedToInactive = (this.isActive) && (delay > 0);

		if (transitionedToActive) {
			this.isActive = true;
		}
		else if (transitionedToInactive) {
			this.isActive = false;
		}

		if (transitionedToActive || transitionedToInactive) {
			for (var i=0; i<this.listeners.length; i++) {
				if (this.listeners[i].updateOnInstant !== undefined) {
					this.listeners[i].updateOnInstant(this);
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
