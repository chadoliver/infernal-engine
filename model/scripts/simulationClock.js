// There are three measures of time:
//  - Sample Time is the time that the event happened in the real world. Often it's a long time ago.
//  - Simulation Time is the time that the event happens within the simulation. Simulation time often 
//    moves faster than sample time, and it can be paused and scrubbed.
//  - Wall Time is the computer time used to calculate when a javascript event should be triggered.

var SimulationClock = (function () {
	// SimulationClock is a class which keeps track of the offset between simulation time and real time. You can think 
	// of SimulationClock as a stopwatch which can be scrubbed and rewound.

	var states = {
		PAUSED: 'paused',
		ACTIVE: 'active',
	};

	var timeEvents = {
		PAUSE: 'pause',
		RESUME
	}

	function Synchron () {
		// Synchron stores the Simulation Time and Real Time representations of a single instant.

		// Date.now() is just a vaguely reasonable initialisation value. It shouldn't ever be read 
		// before it is replaced with something better.
		this.real = Date.now();	
		this.simulation = 0;
	}

	function SimulationClock () {
		this.synchron = new Synchron();
		this.state = states.PAUSED;
		this.callbacks = [];
	}

	//==== The next three methods form the interface for controlling the set of Time instances. =============================//

	SimulationClock.prototype.start = function() {
		// Now may the time start ticking.

		if (this.state !== states.ACTIVE) {
			this.synchron.real = Date.now();	// When the clock is paused, simulation time doesn't change but real time does.
			this.state = states.ACTIVE;
		}
	};

	SimulationClock.prototype.pause = function() {
		// Stop the clock!

		if (this.state !== states.PAUSED) {
			var now = Date.now();
			this.synchron.simulation += now - this.synchron.real;
			this.synchron.real = now;
			this.state = states.PAUSED;
		}
	};

	SimulationClock.prototype.scrub = function(simulationTime) {
		// Change the current simulation time, without changing the real time. Equivalent to skipping forwards or 
		// backwards in a movie.

		var stateCopy = this.state;
		this.pause();					// this is idempotent

		this.synchron.simulation = simulationTime;

		if (stateCopy === states.ACTIVE) this.start();

	};

	//==== The following methods are used by Time instances to respond to control events ====================================//

	SimulationClock.prototype.subscribe = function(callback) {
		// body...
	};

	SimulationClock.prototype.getTime = function() {
		
		var realOffset = 0;
		if (this.state === states.ACTIVE) {
			realOffset = Date.now() - this.synchron.real;
		}
		return this.synchron.simulation + realOffset;
	};

	SimulationClock.prototype.getOffset = function() {
		if (this.state === states.paused) {
			this.synchron.real = Date.now();
		}
		return this.synchron.real - this.synchron.simulation;
	};

	return SimulationClock;
})
