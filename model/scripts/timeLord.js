var TimeLord = (function () {
	// TimeLord is a singleton class which manages Time instances.

	function TimeLord () {
		this.simulationClock = new SimulationClock();
		this.timeInstances = [];
	}

	TimeLord.prototype.start = function() {
		this.simulationClock.start();
	};

	TimeLord.prototype.pause = function() {
		this.simulationClock.pause();
	};

	TimeLord.prototype.scrub = function(simulationTime) {
		this.simulationClock.scrub(simulationTime);
	};

	TimeLord.prototype.controlTime = function(subject) {

		if (Object.prototype.toString.call( subject ) === '[object Array]') { 	// if subject is an array, we assume each element is a Time instance
			for (var i=0; i<subject.length; i++) {
				this.timeInstances.push(subject[i]);
			}
		} 
		else {																	// otherwise we assume it's a single Time instance
			this.timeInstances.push(subject);
		}
	};

	return TimeLord;
})();