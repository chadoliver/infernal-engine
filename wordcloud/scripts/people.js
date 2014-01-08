(function() {


	var Marker = (function() {
		// a descriptive comment ...
	
		function Marker(person, map, initialLocation) {
			// Marker represents a pointer thingy on the map. In our case, it is a visual representation of a person's
			// location at a given time.

			this.person = person;
			this.map = map;
			this.location = null;

			if (initialLocation !== undefined) {
				this.create(initialLocation);
			}
			
			this.marker = null;
		}

		Marker.prototype.create = function(location) {

			this.marker = new google.maps.Marker({
			    position: new google.maps.LatLng(this.location.latitude, this.location.longitude),
			    map: this.map,
			    title: this.person.name
			}),
		};

		Marker.prototype.setLocation = function(location) {
			
			if (this.marker === null) {	// if we've never been given a location before, this.marker won't have been initialised.
				this.create(location);
			}
			else {

			}
		};
	
		return Marker;
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

			this.marker = new Marker(this, map, undefined);		// the marker's location is undefined until .registerAction() is called.
			this.actions = [];

			this.currentLocationSource = null;
			this.currentMessageSource = null;
		}

		Person.prototype.sortActions = function() {
			// sort actions in this.actions by their sampleTime.
			
			this.actions.sort( function compare(a, b) {
				if (a.sampleTime < b.sampleTime) return -1;
				if (a.sampleTime > b.sampleTime) return 1;
				else return 0;
			});
		};

		Person.prototype.registerAction = function(actions) {
			
			this.actions.push(action);
			action.registerListener(this);
			this.updateOnAction(action);
		};

		Person.prototype.setLocationFromAction = function(action) {
			
			if (action !== undefined) {
				this.marker.setLocation(action.location);
				this.currentLocationSource = action;
			} else {
				this.marker.setLocation(undefined);
				this.currentLocationSource = null;
			}
		};

		Person.prototype.progressLocation = function(action) {

			if (action.sampleTime > this.currentLocationSource.sampleTime) {
				if (action.location !== undefined) {
					this.setLocationFromAction(action);
				}
			} 
			// else the action doesn't influence the current location, so we don't do anything.
		};

		Person.prototype.regressLocation = function(action) {

			if (action === this.currentLocationSource) {

				this.sortActions();	// ensure that the actions are sorted by sample time.

				var i = this.actions.length
				while (i--) {
					if (this.actions[i].isActive) {
						if (this.actions[i].location !== undefined) {
							this.setLocationFromAction(this.actions[i]);
							return;
						}
					}
				}

				// if we get this far, then there is no active action which specifies a location.
				this.setLocationFromAction(undefined);
			}
			// else the action doesn't influence the current location, so we don't do anything.
		};

		Person.prototype.updateOnAction = function(action) {

			/*
			There are two issues here: dealing with changes to the set of active messages, and dealing with 
			changes to the Person's current location. At the moment, we won't consider changes to the set of 
			active messages. This will come later.

			Now consider actions which alter the current location. There are (again) two cases.
				- In the first case, the action .isActive, which indicates that time is moving forward (this 
				  is a one-way transistion in simulation time). Therefore, if the action specifies a location, 
				  this will become the Person's new 'current' location.
				- In the second case, the action !.isActive, which indicates that time is being rolled back. 
				  Now, remember that at any time only one action, is used to determine the current location (often
				  this is the most recent action). If it is this action which is being deactived, we need to 
				  iterate backwards through the actions until we find one which provides a location. If the 
				  deactivation doesn't influence the current location, then obviously we don't need to do 
				  anything at the moment.
			*/
			
			if (action.isActive) {
				console.log(action.message.text);
				this.progressLocation(action);
			} 
			else { // if time is being rolled back
				this.regressLocation(action);
			}
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

	function begin (actions) {

		var personSet = new PersonSet();

		for (var i=0; i<actions.length; i++) {
			personSet.registerAction(actions[i]);
		}
	}


	window['WordCloud'] = WordCloud; // <-- Constructor
	window['WordCloud'].prototype['paint'] = WordCloud.prototype.paint;
	window['WordCloud'].prototype['putWord'] = WordCloud.prototype.putWord;

})();
