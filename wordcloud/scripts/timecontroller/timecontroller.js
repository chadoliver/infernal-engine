(function() {

	// There are three measures of time:
	//  - Sample Time is the time that the event happened in the real world. Often it's a long time ago.
	//  - Simulation Time is the time that the event happens within the simulation. Simulation time often 
	//    moves faster than sample time, and it can be paused and scrubbed.
	//  - Wall Time is the computer time used to calculate when a javascript event should be triggered.


	//===========================================================================================================//


	var Clock = (function() {
		// Clock is the class which encapsulates the digital clock in the bottom right of the web page. This 
		// class is just a View component; it doesn't do anything except update the time on the screen.

		var padNumber = function(number) {
			return ("0" + number.toString()).slice(-2);
		};

		function Clock(timeController, zeroTime) {

			this.zeroTime = zeroTime*1000 || 0;
			this.sampleTimeSpeedup = null;
			this.simulationTimeOffset = null;
			this.intervalHandle = null;

			this.elements = {
				hours: document.getElementById('hours'),
				minutes: document.getElementById('minutes'),
				seconds: document.getElementById('seconds'),
				slider: document.getElementById('scrubber').getElementsByTagName('input')[0]
			};

			timeController.subscribe(this);
		}

		Clock.prototype.start = function(sampleTimeSpeedup, simulationTimeOffset) {

			this.pause(); // cancel any running timer.

			this.sampleTimeSpeedup = sampleTimeSpeedup;
			this.simulationTimeOffset = simulationTimeOffset;

			this.updateScreen();
			this.intervalHandle = setInterval(this.updateScreen.bind(this), 50); // update the screen every tenth of a second.
		};

		Clock.prototype.pause = function() {

			if (this.intervalHandle !== null) {
				clearInterval(this.intervalHandle);
				this.intervalHandle = null;
			}
		};

		Clock.prototype.updateScreen = function() {

			var simulationTime = Date.now() - this.simulationTimeOffset
			var rawSampleTime = simulationTime * this.sampleTimeSpeedup + this.zeroTime; // in milliseconds
			var trimmed = Math.floor(rawSampleTime / 1000);

			var seconds = Math.floor(trimmed % 60);
			trimmed = trimmed / 60;

			var minutes = Math.floor(trimmed % 60);
			trimmed = trimmed / 60;

			var hours = Math.floor(trimmed % 24);

			this.elements.hours.innerHTML = padNumber(hours);
			this.elements.minutes.innerHTML = padNumber(minutes);
			this.elements.seconds.innerHTML = padNumber(seconds);
		};

		return Clock;
	})();


	//===========================================================================================================//


	var TimeController = (function () {
		// Clock is the central location for managing the current simulation time. With this class,
		// all subscribed Time instances can be paused, resumed, and scrubbed at the same time.

		var states = {
			PAUSED: 'paused',
			ACTIVE: 'active',
		};

		function TimeController (sampleTimeSpeedup) {

			this.elements = {
			    minutes: document.getElementById('minutes'),
			    seconds: document.getElementById('seconds'),
			    scrubber: document.getElementById('scrubber'),
			    start: document.getElementById('start'),
			    pause: document.getElementById('pause')
			};

			this.sampleTimeSpeedup = sampleTimeSpeedup;
			
			this.subscribers = [];
			this.state = states.PAUSED;

			this.synchron = {		// Synchron stores the Simulation Time and Real Time representations of a single instant.
				real: Date.now(),
				simulation: 0,
			};
		}

		//===== The Upsteam Interface =================================================================================//

		TimeController.prototype.toggle = function() {
			// start if it's currently paused; pause if it's currently playing.

			if (this.state === states.PAUSED) {
				this.start();
			}
			else if (this.state === states.ACTIVE) {
				this.pause();
			}
		};

		TimeController.prototype.start = function() {
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

		TimeController.prototype.pause = function() {
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

		TimeController.prototype.scrub = function(simulationTime) {
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

		TimeController.prototype.subscribe = function(callback) {
			this.subscribers.push[subscriber];
		};

		TimeController.prototype.getTime = function() {
			
			var realOffset = 0;
			if (this.state === states.ACTIVE) {
				realOffset = Date.now() - this.synchron.real;
			}
			return this.synchron.simulation + realOffset;
		};

		return TimeController;
	});

})();
