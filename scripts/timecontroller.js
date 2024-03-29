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

			// The clock displays the current Sample time. The Simulation time is trivially given by Date.now() - simulationTimeOffset,
			// so the complexity comes from calculating sample time from simulation time.

			this.zeroTime = zeroTime || 0;						// units: milliseconds of sample time
			this.sampleTimeSpeedup = null;
			this.simulationTimeOffset = null;					// units: milliseconds of real time
			this.intervalHandle = null;

			this.elements = {
				hours: document.getElementById('hours'),
				minutes: document.getElementById('minutes'),
				seconds: document.getElementById('seconds')
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
			this.simulationTimeOffset = simulationTimeOffset;	// units: milliseconds of real time
			this.updateScreen();
		};

		Clock.prototype.updateScreen = function() {

			var simulationTime = Date.now() - this.simulationTimeOffset;					// units: milliseconds of simulation time, obviously
			var rawSampleTime = simulationTime * this.sampleTimeSpeedup + this.zeroTime; 	// units: milliseconds of sample time
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


	var ProgressBar = (function() {
		// a descriptive comment ...

		function pauseEvent(e){
		    if(e.stopPropagation) e.stopPropagation();
		    if(e.preventDefault) e.preventDefault();
		    e.cancelBubble = true;
		    e.returnValue = false;
		    return false;
		}
	
		function ProgressBar(zeroTime, endTime) {

			var self = this;

			this.elements = {
				context: document.getElementById('scrubber'),
				rail: document.getElementById('rail'),
				indicator: document.getElementById('indicator'),
				handle: document.getElementById('handle'),
			};

			this.listeners = [];
			this.intervalHandle = null;
			this.sampleTimeSpeedup = null;
			this.simulationTimeOffset = null;			

			this.zeroTime = zeroTime || 0;			// units: milliseconds of sample time
			this.endTime  = endTime  || 0;			// units: milliseconds of sample time

			this.width = this.elements.rail.clientWidth;
			this.halfIndicatorWidth = this.elements.indicator.clientWidth/2;
			this.horizontalOffset = this.elements.rail.getBoundingClientRect().left;

			this.sampleMillisecondsPerPixel = (this.endTime - this.zeroTime) / this.width;
			this.simulationMillisecondsPerPixel = null;	// this can only be set once we know sampleTimeSpeedup.

			this.eventHandlers = {
				onMouseDown: self.onMouseDown.bind(self),
				onMouseUp: self.onMouseUp.bind(self),
				onMouseMove: self.onMouseMove.bind(self),
				onMouseClick: self.onMouseClick.bind(self),
				onTick: self.onTick.bind(self)
			};

			this.elements.handle.addEventListener("mousedown", this.eventHandlers.onMouseDown, true);
			this.elements.rail.addEventListener("mousedown", function(){pauseEvent(event || window.event)}, true);
			this.elements.rail.addEventListener("click", this.eventHandlers.onMouseClick, true);
		}

		//====================================//

		ProgressBar.prototype.setPosition = function(sampleTime) {
			// Remember, this accepts position as a *time*, not a pixel offset.

			var position = (sampleTime - this.zeroTime) / this.sampleMillisecondsPerPixel;
			var boundedPosition = Math.max(0, Math.min(this.width, position));
			this.elements.indicator.style.marginLeft = boundedPosition - this.halfIndicatorWidth;
		};

		ProgressBar.prototype.getSampleTime = function(x) {
			
			var position = x - this.horizontalOffset;
			var boundedPosition = Math.max(0, Math.min(this.width, position));
			var sampleTime = boundedPosition * this.sampleMillisecondsPerPixel + this.zeroTime;

			return sampleTime;
		};

		ProgressBar.prototype.followMouse = function(event) {
			
			pauseEvent(event || window.event);

			var sampleTime = this.getSampleTime(event.x);
			this.setPosition(sampleTime);

			return sampleTime;
		};

		//====================================//

		ProgressBar.prototype.onMouseDown = function(event) {
			// enter 'scrubbing' mode

			pauseEvent(event || window.event);

			document.addEventListener('mousemove', this.eventHandlers.onMouseMove, false);
			document.addEventListener('mouseup', this.eventHandlers.onMouseUp, true);

			// notify listener(s) that we've begun scrubbing.
			for (var i = 0; i < this.listeners.length; i++) {
				this.listeners[i].enterScrubbingMode();
			};
		};

		ProgressBar.prototype.onMouseUp = function(event) {
			// exit scrubbing mode

			document.removeEventListener('mousemove', this.eventHandlers.onMouseMove, false);
			document.removeEventListener('mouseup', this.eventHandlers.onMouseUp, true);

			// notify listener(s) that we've finished scrubbing.
			for (var i = 0; i < this.listeners.length; i++) {
				this.listeners[i].exitScrubbingMode();
			}
		}

		ProgressBar.prototype.onMouseMove = function(event) {

			var sampleTime = this.followMouse(event);

			// notify listener(s)
			for (var i = 0; i < this.listeners.length; i++) {
				this.listeners[i].scrub(sampleTime);
			};
		};

		ProgressBar.prototype.onMouseClick = function(event) {

			var sampleTime = this.followMouse(event);				

			// notify listener(s)
			for (var i = 0; i < this.listeners.length; i++) {
				this.listeners[i].enterScrubbingMode();
				this.listeners[i].scrub(sampleTime);
				this.listeners[i].exitScrubbingMode();
			};
		};

		//====================================//

		ProgressBar.prototype.start = function(sampleTimeSpeedup, simulationTimeOffset) {

			this.pause(); // cancel this.intervalHandle

			this.sampleTimeSpeedup = sampleTimeSpeedup;
			this.simulationTimeOffset = simulationTimeOffset;

			this.simulationMillisecondsPerPixel = this.sampleMillisecondsPerPixel / sampleTimeSpeedup;
			var tickInterval = Math.max(10, this.simulationMillisecondsPerPixel);

			this.onTick();
			this.intervalHandle = setInterval(this.eventHandlers.onTick, tickInterval);
		};

		ProgressBar.prototype.pause = function() {

			if (this.intervalHandle !== null) {
				clearInterval(this.intervalHandle);
				this.intervalHandle = null;
			}
		};

		ProgressBar.prototype.onTick = function() {

			var simulationTime = Date.now() - this.simulationTimeOffset;						// units: milliseconds of simulation time
			var sampleTime = simulationTime * this.sampleTimeSpeedup + this.zeroTime;			// units: milliseconds of sample time
			
			this.setPosition(sampleTime);
		};

		//====================================//

		ProgressBar.prototype.registerListener = function(listener) {
			this.listeners.push(listener);
		};		

		ProgressBar.prototype.updateOnMoment = function(moment) {
			// This method is called by TimeController's resetMoment, which fires once the slider gets to the end
			// of its rail.

			if (moment.isActive) {
				this.setPosition(this.zeroTime);

				for (var i = 0; i < this.listeners.length; i++) {
					this.listeners[i].enterScrubbingMode();
					this.listeners[i].scrub(this.zeroTime);
					this.listeners[i].exitScrubbingMode();
				};
			}
			// once we get to this point, moment.isActive is guaranteed to be false (either because it always was, or
			// because it was scrubbed back to the start)
		};
	
		return ProgressBar;
	})();


	//===========================================================================================================//


	var TimeController = (function() {
		// Clock is the central location for managing the current simulation time. With this class,
		// all subscribed Time instances can be paused, resumed, and scrubbed at the same time.

		var states = {
			PAUSED: 'paused',
			ACTIVE: 'active'
		};

		function TimeController(zeroTime, endTime, sampleTimeSpeedup) {

			this.zeroTime = zeroTime || 0;	// units: milliseconds of sample time
			this.endTime = endTime || 100*1000;
			this.sampleTimeSpeedup = sampleTimeSpeedup || 1;

			this.listeners = [];
			this.state = states.PAUSED;

			this.synchron = { // Synchron stores the Simulation Time and Real Time representations of a single moment.
				real: Date.now(),			// units: milliseconds of wall time
				simulation: 0				// units: milliseconds of simulation time
			};
		}

		TimeController.prototype.begin = function() {
			// This function should be called once the system has been assembled. It hooks up the UI and starts time ticking.
			
			var playPauseButton = new PlayPauseButton();
			playPauseButton.registerListener(this);

			var clock = new Clock(this.zeroTime);
			this.registerListener(clock);

			progressBar = new ProgressBar(this.zeroTime, this.endTime);
			progressBar.registerListener(this);
			this.registerListener(progressBar);

			var resetMoment = new Moment(this.endTime, this.zeroTime);	// this sample moment should fire when the slider gets to the end of its rail.

			progressBar.resetMoment = resetMoment;
			this.registerListener(resetMoment);
			resetMoment.registerListener(progressBar);

			playPauseButton.play();
		};

		TimeController.prototype.__start = function() {
			// Allow simulation time to begin or resume.

			this.synchron.real = Date.now(); // When the clock is paused, simulation time doesn't change but real time does.

			var offset = this.synchron.real - this.synchron.simulation;
			for (var i = 0; i < this.listeners.length; i++) {
				if (this.listeners[i].start !== undefined) {
					this.listeners[i].start(this.sampleTimeSpeedup, offset);
				}
			};
		};

		TimeController.prototype.__pause = function() {
			// Pause simulation time.

			var now = Date.now();
			this.synchron.simulation += now - this.synchron.real;
			this.synchron.real = now;
			
			for (var i = 0; i < this.listeners.length; i++) {
				if (this.listeners[i].pause !== undefined) {
					this.listeners[i].pause();
				}
			};
		};

		TimeController.prototype.start = function() {
			// Allow simulation time to begin or resume.

			if (this.state !== states.ACTIVE) {
				this.__start();
				this.state = states.ACTIVE;
			}
		};

		TimeController.prototype.pause = function() {
			// Pause simulation time.

			if (this.state !== states.PAUSED) {
				this.__pause();
				this.state = states.PAUSED;
			}
		};

		TimeController.prototype.enterScrubbingMode = function() {
			// when we're scrubbing, time should pause if it is not already paused. 

			this.__pause();	// this pauses time without altering the associated metadata. For example, this.state is unchanged.
		};

		TimeController.prototype.scrub = function(sampleTime) {
			// Change the current simulation time, without changing the real time. Equivalent to skipping forwards or 
			// backwards in a movie.

			var simulationTime = (sampleTime - this.zeroTime) / this.sampleTimeSpeedup;

			var offset = Date.now() - simulationTime;						// units: milliseconds of real time
			this.synchron.simulation = simulationTime;						// units: milliseconds of simulation time

			for (var i = 0; i < this.listeners.length; i++) {
				if (this.listeners[i].scrub !== undefined) {
					this.listeners[i].scrub(this.sampleTimeSpeedup, offset);
				}
			};
		};

		TimeController.prototype.exitScrubbingMode = function() {
			
			if (this.state === states.ACTIVE) {
				this.__start();		// now the real state is aligned with the 'official' state.
			}
			// if (this.state === states.PAUSED), we don't have to do anything because time is already paused.
		};

		TimeController.prototype.registerListener = function(listener) {
			this.listeners.push(listener);
		};

		TimeController.prototype.getSimulationTime = function() {			// returns time in units of: milliseconds of simulation time

			return this.synchron.simulation;
		};

		return TimeController;
	})();

	window['TimeController'] = TimeController; // <-- Constructor

})();
