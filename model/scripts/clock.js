// There are three measures of time:
//  - Sample Time is the time that the event happened in the real world. Often it's a long time ago.
//  - Simulation Time is the time that the event happens within the simulation. Simulation time often 
//    moves faster than sample time, and it can be paused and scrubbed.
//  - Wall Time is the computer time used to calculate when a javascript event should be triggered.

var Clock = (function () {
	// Clock is the central location for managing the current simulation time. With this class,
	// all subscribed Time instances can be paused, resumed, and scrubbed at the same time.

	var states = {
		PAUSED: 'paused',
		ACTIVE: 'active',
	};

	function Clock (sampleTimeSpeedup) {

		this.sampleTimeSpeedup = sampleTimeSpeedup;
		
		this.subscribers = [];
		this.state = states.PAUSED;

		this.synchron = {		// Synchron stores the Simulation Time and Real Time representations of a single instant.
			real: Date.now(),
			simulation: 0,
		};
	}

	//===== The Upsteam Interface =================================================================================//

	Clock.prototype.start = function() {
		// Allow simulation time to begin or resume.

		if (this.state !== states.ACTIVE) {
			this.synchron.real = Date.now();	// When the clock is paused, simulation time doesn't change but real time does.
			this.state = states.ACTIVE;

			var offset = this.synchron.real - this.synchron.simulation;
			for (var i=0; i<this.subscribers.length; i++) {
				this.subscribers[i].start(this.sampleTimeSpeedup, offset);
			};
		}
	};

	Clock.prototype.pause = function() {
		// Pause simulation time.

		if (this.state !== states.PAUSED) {
			var now = Date.now();
			this.synchron.simulation += now - this.synchron.real;
			this.synchron.real = now;
			this.state = states.PAUSED;

			for (var i=0; i<this.subscribers.length; i++) {
				this.subscribers[i].pause();
			};
		}
	};

	Clock.prototype.scrub = function(simulationTime) {
		// Change the current simulation time, without changing the real time. Equivalent to skipping forwards or 
		// backwards in a movie. Note that scrub() won't have any *immediate* effect if this.state is PAUSED.

		this.synchron.simulation = simulationTime;

		if (this.state === states.ACTIVE) {
			this.synchron.real = Date.now();

			var offset = this.synchron.real - this.synchron.simulation;
			for (var i=0; i<this.subscribers.length; i++) {
				this.subscribers[i].start(this.sampleTimeSpeedup, offset);
			};
		}
	};

	//==== The following methods are used by Time instances to respond to control events ====================================//

	Clock.prototype.subscribe = function(callback) {
		this.subscribers.push[subscriber];
	};

	Clock.prototype.getTime = function() {
		
		var realOffset = 0;
		if (this.state === states.ACTIVE) {
			realOffset = Date.now() - this.synchron.real;
		}
		return this.synchron.simulation + realOffset;
	};

	return Clock;
})
