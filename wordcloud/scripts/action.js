(function() {


	var Message = (function () {
		// This class is pretty empty at the moment, but the intention is to flesh it out later when I build the 
		// people -> messageboard interface.

		function Message (text) {
			this.text = text;
		};

		return Message;

	})();


	//===========================================================================================================//


	var Location = (function () {

		function Location (latitude, longitude) {
			this.latitude = latitude;
			this.longitude = longitude;
		};

		Location.prototype.difference = function(other) {
			var latitude = this.latitude - other.latitude;
	        var longitude = this.longitude - other.longitude;
	        return new Location(latitude, longitude);
		};

		Location.prototype.distance = function(other) {
			var dif = this.difference(other);
	        var distance = Math.sqrt(dif.latitude*dif.latitude + dif.longitude*dif.longitude);
	        return distance;
		};

		return Location;
	})();


	//===========================================================================================================//


	var SimulationInstant = (function () { 
		// This class is used to represent a instant in Simulation Time. 

		var states = {
			PAST: 'past',
			FUTURE: 'future',
		};

		function SimulationInstant (sampleTime, zeroTime) {
			
			this.sampleTime = sampleTime;	// this.sampleTime is the cannonical source of simulation time and real time.
			this.zeroTime = zeroTime;		// this.zeroTime is the Sample Time of the earliest event.

			this.timeoutHandle = null;
			this.temporalState = states.FUTURE;
			this.subscribers = [];
		}

		SimulationInstant.prototype.start = function(sampleTimeSpeedup, simulationTimeOffset) {
			
			this.pause();	// cancel any running timer.

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

			this.updateTemporalState(delay);

			if (delay > 0) {	// it's no use setting a timeout if the event happens in the past.
				this.timeoutHandle = window.setTimeout(this.onCountdownFires.bind(this), delay);
			}
		};

		SimulationInstant.prototype.pause = function() {
			
			if (this.timeoutHandle !== null) {
				window.clearTimeout(this.timeoutHandle);
				this.timeoutHandle = null;
			}
		};

		//=== The Inner Processing Layer ===//

		// These would both be private functions if javascript wasn't written in 10 days.

		SimulationInstant.prototype.onCountdownFires = function() {

			this.timeoutHandle = null;
			this.updateTemporalState(-1);	// any negative number would do here. 
		}

		SimulationInstant.prototype.updateTemporalState = function(delay) {
			
			if ((this.temporalState === states.FUTURE) && (delay <= 0)) {
				// Hey look, the event just happened! (Or at least, it has happened between now and whenever we
				// last checked.)
				
				this.temporalState = states.PAST;
				for (var i=0; i<this.listeners.length; i++) {
					this.listeners[i].activate();
				};
			}
			else if ((this.temporalState === states.PAST) && (delay > 0)) {
				// The event just un-happened! This occurs when the clock is scrubbed to an earlier time.

				this.temporalState = states.FUTURE;
				for (var i=0; i<this.listeners.length; i++) {
					this.listeners[i].deactivate();
				};
			}
		};

		//=== The Downstream Interface ===//

		SimulationInstant.prototype.registerListener = function(listener) {
			// This is used by Action instances, so that they can be turned on and off based on the time that the Action
			// occured. Each subscriber object should have an activate() function and a deactivate() function.

			this.listeners.push(listener);
		};

		return SimulationInstant;
	})();


	//===========================================================================================================//


	var Action = (function () {
		
		function Action (message, location, personId, sampleTime, timeController) {

			this.message = message;
			this.location = location;
			this.personId = personId;
			this.sampleTime = sampleTime;

			this.simulationInstant = new SimulationInstant(this.sampleTime, timeController.zeroTime);
			timeController.registerListener(this.simulationInstant);
			this.simulationInstant.registerListener(this);

			this.isActive = false;
			this.listeners = [];
		}

		Action.prototype.activate = function() {
			// this is called by the Action's associated Time instance.
			
			if ( ! this.isActive) {
				this.isActive = true;
				console.log('activate');
				this.notifyListeners();
			}
		};

		Action.prototype.deactivate = function() {
			// this is called by the Action's associated Time instance.
			
			if (this.isActive) {
				this.isActive = false;
				console.log('deactivate');
				this.notifyListeners();
			}
		};

		Action.prototype.notifyListeners = function() {

			for (var i=0; i<this.listeners.length; i++) {
				this.listeners[i].updateOnAction(this);
			}
		};

		Action.prototype.registerListener = function(listener) {
			this.listeners.push(listener);
		};

		return Action;
	})();

	
	//===========================================================================================================//

	/*
	function begin (actions) {

		var personSet = new PersonSet();

		for (var i=0; i<actions.length; i++) {
			personSet.registerAction(actions[i]);
		}
	}
	*/

	//===========================================================================================================//
	
	// The google closure compiler obfuscates the names of classes, properties, and methods. However, it doesn't alter
	// string literals. We therefore use the following method to ensure that the necessary tokens are available to the
	// outside world.

	window['Action'] = Action; // <-- Constructor
	
	window['Action']['isActive'] = Action.isActive;
	window['Action']['personId'] = Action.personId;
	window['Action']['sampleTime'] = Action.sampleTime;
	window['Action']['message'] = Action.message;
	window['Action']['message']['text'] = Action.message.text;

	window['Action'].prototype['registerListener'] = Action.prototype.registerListener;
	window['Action'].prototype['updateOnAction'] = Action.prototype.updateOnAction;

})();
