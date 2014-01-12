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


	var ProgressBar = (function() {
		// a descriptive comment ...

		function pauseEvent(e){
		    if(e.stopPropagation) e.stopPropagation();
		    if(e.preventDefault) e.preventDefault();
		    e.cancelBubble=true;
		    e.returnValue=false;
		    return false;
		}
	
		function ProgressBar(zeroTime, endTime) {

			var self = this;

			this.zeroTime = zeroTime || 0;
			this.endTime  = endTime  || 0;
			this.currentTime = this.zeroTime;

			this.sampleTimeSpeedup = null;
			this.simulationTimeOffset = null;

			this.intervalHandle =  null;			// this is always null iff simulation time is paused.

			this.elements = {
				rail: document.getElementById('rail'),
				indicator: document.getElementById('indicator'),
				handle: document.getElementById('handle'),
			};

			this.eventHandlers = {
				onMouseDown: self.onMouseDown.bind(self),
				onMouseUp: self.onMouseUp.bind(self),
				onMouseMove: self.onMouseMove.bind(self)
			};

			this.elements.handle.addEventListener("mousedown", this.eventHandlers.onMouseDown, true);

			this.previousMousePosition = 0;				// this is the mouse's horizontal position at timeOfLastScrub.
			this.tickInterval = this.determineTickInterval();
			this.listeners = [];
		}

		ProgressBar.prototype.determineTickInterval = function() {
			// We want to update with an interval which is the greater of:
			// 	1) The time it takes for the indicator to move half a pixel, or
			//  2) 50 ms, being approximately the smallest interval noticable to humans.

			// assumption: zeroTime and endTime are in milliseconds.
			
			var pixels = this.elements.rail.clientWidth;
			var pixelMovementInterval = (this.endTime - this.zeroTime) / pixels;

			var tickInterval = Math.max(50, pixelMovementInterval);

			return tickInterval;
		};

		ProgressBar.prototype.moveIndicatorTo = function(ms, railWidth) {

			railWidth = railWidth || this.elements.rail.clientWidth;

			var pixelsPerMillisecond =  railWidth / (this.endTime - this.zeroTime);
			var newPosition = ms*pixelsPerMillisecond;
			var boundedPosition = Math.max(0, Math.min(railWidth, newPosition));
			this.elements.indicator.style.marginLeft = boundedPosition;

			//console.log('moving indicator:', ms, pixelsPerMillisecond);
		};

		ProgressBar.prototype.onMouseDown = function(event) {
			// enter 'scrubbing' mode

			pauseEvent(event || window.event);
			console.log('mouse down');

			this.previousMousePosition = event.x;
			document.addEventListener('mousemove', this.eventHandlers.onMouseMove, false);
			document.addEventListener("mouseup", this.eventHandlers.onMouseUp, true);

			// notify listener(s) that we've begun scrubbing.
			for (var i = 0; i < this.listeners.length; i++) {
				//this.listeners[i].beginScrubbing();
			};
		};

		ProgressBar.prototype.onMouseUp = function() {
			// exit scrubbing mode

			console.log('mouse up');

			document.removeEventListener('mousemove', this.eventHandlers.onMouseMove, false);
			document.removeEventListener('mouseup', this.eventHandlers.onMouseUp, true);

			// notify listener(s) that we've finished scrubbing.
			for (var i = 0; i < this.listeners.length; i++) {
				//this.listeners[i].endScrubbing();
			}
		}

		ProgressBar.prototype.onMouseMove = function(event) {

			pauseEvent(event || window.event);

			var railWidth = this.elements.rail.clientWidth;
			var pixelRatio = (event.x - this.previousMousePosition) / railWidth;
			var newSampleTime = this.currentTime + pixelRatio*(this.endTime - this.zeroTime);

			this.previousMousePosition = event.x;
			this.currentTime = newSampleTime;

			this.moveIndicatorTo(newSampleTime, railWidth);
			
			// notify listener(s)
			for (var i = 0; i < this.listeners.length; i++) {
				//this.listeners[i].scrub(newSampleTime);
			};
		};

		ProgressBar.prototype.start = function(sampleTimeSpeedup, simulationTimeOffset) {

			this.pause(); // cancel this.intervalHandle

			this.sampleTimeSpeedup = sampleTimeSpeedup;
			this.simulationTimeOffset = simulationTimeOffset;

			this.onTick();
			this.intervalHandle = setInterval(this.onTick.bind(this), this.tickInterval); // update the screen every 20th of a second.
		};

		ProgressBar.prototype.pause = function() {

			if (this.intervalHandle !== null) {
				clearInterval(this.intervalHandle);
				this.intervalHandle = null;
			}
		};

		ProgressBar.prototype.onTick = function() {

			var simulationTime = Date.now() - this.simulationTimeOffset
			var sampleTime = simulationTime/this.sampleTimeSpeedup + this.zeroTime; // in milliseconds
			
			this.moveIndicatorTo(sampleTime);
		};

		ProgressBar.prototype.registerListener = function(listener) {
			console.log('listening to ProgressBar');
			this.listeners.push(listener);
		};
	
		return ProgressBar;
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
			this.scrub(sampleTimeSpeedup, simulationTimeOffset);
			this.intervalHandle = setInterval(this.updateScreen.bind(this), 50); // update the screen every 20th of a second.
		};

		Clock.prototype.pause = function() {

			if (this.intervalHandle !== null) {
				clearInterval(this.intervalHandle);
				this.intervalHandle = null;
			}
		};

		Clock.prototype.scrub = function(sampleTimeSpeedup, simulationTimeOffset) {
			this.sampleTimeSpeedup = sampleTimeSpeedup;
			this.simulationTimeOffset = simulationTimeOffset;
			this.updateScreen();
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
		}

		TimeController.prototype.begin = function() {
			// This function should be called once the system has been assembled. It hooks up the UI and starts time ticking.

			var progressBar = new ProgressBar(this.zeroTime, this.zeroTime + 10000); 
			
			var playPauseButton = new PlayPauseButton();
			var clock = new Clock(this, this.zeroTime);

			this.registerListener(clock);
			playPauseButton.registerListener(this);
			this.registerListener(progressBar);

			playPauseButton.play();
		};

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
			// backwards in a movie.

			var offset = Date.now() - simulationTime;
			this.synchron.simulation = simulationTime;

			for (var i = 0; i < this.listeners.length; i++) {
				this.listeners[i].scrub(this.sampleTimeSpeedup, offset);
			};
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
			return this.synchron.simulation;
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
