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
		
		function Action (message, location, personId, sampleTime) {

			this.message = message;
			this.location = location;
			this.personId = personId;
			this.sampleTime = sampleTime;

			this.simulationInstant = null;

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

		Action.prototype.registerTimeController = function(timeController) {
			// Now that we've got the time controller, we have everything we need to create a SimulationInstant
			// and hook up the associated event listeners.

			this.timeController = timeController;
			this.simulationInstant = new SimulationInstant(this.sampleTime, timeController.zeroTime);

			timeController.registerListener(timeInstant);
			timeInstant.registerListener(this);
		};

		return Action;
	})();


	//===========================================================================================================//


	var Person = (function () {
		// the Person class represents people, obviously. Specifically, a Person instance is a container for a set of 
		// actions.

		function UUID () {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			    return v.toString(16);
			});
		};

		function Person (id) {
			this.id = id || new UUID();
			this.name = "";

			this.currentPosition = undefined;
			this.actions = [];
		}

		Person.prototype.sortActions = function() {
			// sort actions in this.actions by their timestamp.
			
			this.actions.sort( function compare(a, b) {
				if (a.timestamp < b.timestamp) return -1;
				if (a.timestamp > b.timestamp) return 1;
				else return 0;
			});
		};

		Person.prototype.registerAction = function(actions) {
			
			this.actions.push(action);
			action.registerListener(this);
			this.updateOnAction(action);
		};

		Person.prototype.updateOnAction = function(action) {
			
			if (action.isActive) {
				console.log(action.message.text);
			};
		};

		return Person;
	})();


	//===========================================================================================================//


	var PersonSet = (function() {

		function PersonSet (timeController, actions) {
			this.people = [];
		}

		PersonSet.prototype.getPersonById = function(id) {
			
			for (var i=0; i<this.people.length; i++) {
				var person = this.people[i];
				if ( person.id === id ) {
					return person;
				}
			}

			// If we get to this point, that means there is no Person instance with that id
			var person = new Person(id);
			this.people.push(person);
			return person;
		};

		PersonSet.prototype.registerAction = function(action) {
			
			var person = this.getPersonById(action.personId);
			person.registerAction(action);
		};

		return PersonSet;
	})();


	//===========================================================================================================//

	function begin (timeController, actions) {

		var personSet = new PersonSet();
		if (actions.length === undefined) actions = [actions];

		for (var i=0; i<actions.length; i++) {
			var action = actions[i];

			action.registerTimeController(timeController);
			personSet.registerAction(action);
		}
	}


	

	

	window['WordCloud'] = WordCloud; // <-- Constructor
	window['WordCloud'].prototype['paint'] = WordCloud.prototype.paint;
	window['WordCloud'].prototype['putWord'] = WordCloud.prototype.putWord;

})();
