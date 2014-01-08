(function() {

	// There are three measures of time:
	//  - Sample Time is the time that the event happened in the real world. Often it's a long time ago.
	//  - Simulation Time is the time that the event happens within the simulation. Simulation time often 
	//    moves faster than sample time, and it can be paused and scrubbed.
	//  - Wall Time is the computer time used to calculate when a javascript event should be triggered.


	//===========================================================================================================//


	var PlayPauseButton = (function() {
		// PlayPauseButton models the play/pause button, obviously. TimeController subscribes to this, so that 
		// pressing the button will toggle the progression of simulationTime throughout the webapp.

		var buttonTypes = {
			PAUSE: 'pause',
			PLAY: 'play'
		};

		function PlayPauseButton() {

			this.listeners = [];
			this.buttonType = buttonTypes.PLAY; // time is paused, and the play button is displayed.

			this.elements = {
				play: document.getElementById('play-icon'),
				pause: document.getElementById('pause-icon')
			};

			this.elements.play.addEventListener("click", this.play.bind(this), true);
			this.elements.pause.addEventListener("click", this.pause.bind(this), true);
		}

		PlayPauseButton.prototype.play = function() {

			for (var i = 0; i < this.listeners.length; i++) {
				this.listeners[i].start();
			};
			this.buttonType = buttonTypes.PAUSE;
			this.elements.play.style.display  = 'none';
			this.elements.pause.style.display = 'block';
		};

		PlayPauseButton.prototype.pause = function() {

			for (var i = 0; i < this.listeners.length; i++) {
				this.listeners[i].pause();
			};
			this.buttonType = buttonTypes.PLAY;
			this.elements.play.style.display  = 'block';
			this.elements.pause.style.display = 'none';
		};

		PlayPauseButton.prototype.registerListener = function(listener) {
			console.log('listening to playPauseButton');
			this.listeners.push(listener);
		};

		return PlayPauseButton;
	})();


	//===========================================================================================================//


	var Clock = (function() {
		// Clock is the class which encapsulates the digital clock in the bottom right of the web page. This 
		// class is just a View component; it doesn't do anything except update the time on the screen.

		var padNumber = function(number) {
			return ("0" + number.toString()).slice(-2);
		};

		function Clock(zeroTime) {

			this.zeroTime = zeroTime * 1000 || 0;
			this.sampleTimeSpeedup = null;
			this.simulationTimeOffset = null;
			this.intervalHandle = null;

			this.elements = {
				hours: document.getElementById('hours'),
				minutes: document.getElementById('minutes'),
				seconds: document.getElementById('seconds'),
				slider: document.getElementById('scrubber').getElementsByTagName('input')[0]
			};
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


	var TimeController = (function() {
		// Clock is the central location for managing the current simulation time. With this class,
		// all subscribed Time instances can be paused, resumed, and scrubbed at the same time.

		var states = {
			PAUSED: 'paused',
			ACTIVE: 'active'
		};

		function TimeController(zeroTime, sampleTimeSpeedup) {

			this.zeroTime = zeroTime || 0;
			this.sampleTimeSpeedup = sampleTimeSpeedup || 1;

			this.listeners = [];
			this.state = states.PAUSED;

			this.synchron = { // Synchron stores the Simulation Time and Real Time representations of a single instant.
				real: Date.now(),
				simulation: 0
			};

			var playPauseButton = new PlayPauseButton();
			var clock = new Clock(this, this.zeroTime);

			this.registerListener(clock);
			playPauseButton.registerListener(this);

			playPauseButton.play();
		}

		TimeController.prototype.toggle = function() {
			// start if it's currently paused; pause if it's currently playing.

			if (this.state === states.PAUSED) {
				this.start();
			} else if (this.state === states.ACTIVE) {
				this.pause();
			}
		};

		TimeController.prototype.start = function() {
			// Allow simulation time to begin or resume.

			if (this.state !== states.ACTIVE) {
				this.synchron.real = Date.now(); // When the clock is paused, simulation time doesn't change but real time does.
				this.state = states.ACTIVE;

				var offset = this.synchron.real - this.synchron.simulation;
				for (var i = 0; i < this.listeners.length; i++) {
					this.listeners[i].start(this.sampleTimeSpeedup, offset);
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

				for (var i = 0; i < this.listeners.length; i++) {
					this.listeners[i].pause();
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
				for (var i = 0; i < this.listeners.length; i++) {
					this.listeners[i].start(this.sampleTimeSpeedup, offset);
				};
			}
		};

		TimeController.prototype.registerListener = function(listener) {
			console.log('listening to timeController');
			this.listeners.push(listener);
		};

		TimeController.prototype.getTime = function() {

			var realOffset = 0;
			if (this.state === states.ACTIVE) {
				realOffset = Date.now() - this.synchron.real;
			}
			return this.synchron.simulation + realOffset;
		};

		return TimeController;
	})();


	window['TimeController'] = TimeController; // <-- Constructor

	window['TimeController'].prototype['start'] = TimeController.prototype.start;
	window['TimeController'].prototype['pause'] = TimeController.prototype.pause;
	window['TimeController'].prototype['scrub'] = TimeController.prototype.scrub;

	window['TimeController'].prototype['subscribe'] = TimeController.prototype.subscribe;
	window['TimeController'].prototype['getTime'] = TimeController.prototype.getTime;

})();
