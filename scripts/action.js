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


	var Action = (function () {
		
		function Action (message, location, personId, sampleTime, timeController) {

			this.message = message;
			this.location = location;
			this.personId = personId;
			this.sampleTime = sampleTime;		// units: milliseconds of sample time

			this.sampleInstant = new SampleInstant(this.sampleTime, timeController.zeroTime);		// both parameters have units of milliseconds of sample time
			timeController.registerListener(this.sampleInstant);
			this.sampleInstant.registerListener(this);

			this.isActive = false;
			this.listeners = [];
		}

		Action.prototype.activate = function() {
			// this is called by the Action's associated SampleInstant instance.
			
			if ( ! this.isActive) {
				this.isActive = true;
				this.notifyListeners();
			}
		};

		Action.prototype.deactivate = function() {
			// this is called by the Action's associated SampleInstant instance.
			
			if (this.isActive) {
				this.isActive = false;
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


	var ActionSet = (function() {
		// a descriptive comment ...
	
		function ActionSet(timeController, personSet) {
			
			this.timeController = timeController;
			this.personSet = personSet;
		}

		ActionSet.prototype.putAction = function(message, location, personId, sampleTime) {
			var action = new Action(message, location, personId, sampleTime, this.timeController);
			this.personSet.registerAction(action);
		};
	
		return ActionSet;
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

	window['Action'].prototype['registerListener'] = Action.prototype.registerListener;
	window['Action'].prototype['updateOnAction'] = Action.prototype.updateOnAction;

	window['ActionSet'] = ActionSet; // <-- Constructor
	window['ActionSet']['putAction'] = ActionSet.putAction;

})();