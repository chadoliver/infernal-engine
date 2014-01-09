(function() {


	var Marker = (function() {
		// a descriptive comment ...

		function Marker(person, map, initialLocation) {
			// Marker represents a pointer thingy on the map. In our case, it is a visual representation of a person's
			// location at a given time.

			this.marker = null;		// an instance of google.maps.Marker();

			this.person = person;
			this.map = map;
			this.location = null;

			this.showAt(initialLocation);
		}

		Marker.prototype.hide = function() {
			// What we're really doing is deleting the marker (not just hiding it). This is perhaps overkill, but it makes 
			// it a little easier to manage markers.

			if (this.marker !== null) {
				this.marker.setMap(null);
				this.marker = null;
			}
		};

		Marker.prototype.showAt = function(location) {
			
			if (location === undefined) {
				this.hide();
			}
			else if (this.marker === null) {
				// the marker doesn't exist, so we create it
				this.marker = new google.maps.Marker({
				    position: new google.maps.LatLng(location.latitude, location.longitude),
				    map: this.map.map,	// this.map is an instance of Map(), while this.map.map is an instance of google.maps.Map().
				    title: this.person.name
				});
			}
			else {
				// the marker exists, so we just need to change the location.
				this.marker.setPosition(location.latitude, location.longitude);
			}
		};
	
		return Marker;
	})();


	//===========================================================================================================//


	var Person = (function () {
		// the Person class represents people, obviously. In practice, a Person instance is a container for a set of 
		// actions.

		function UUID () {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			    return v.toString(16);
			});
		};

		function Person (id, map, name) {
			this.id = id || new UUID();
			this.name = name || "Joe Blogs";

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

		Person.prototype.registerAction = function(action) {
			
			this.actions.push(action);
			action.registerListener(this);
			this.updateOnAction(action);
		};

		Person.prototype.setLocationFromAction = function(action) {

			if (action !== undefined) {
				this.marker.showAt(action.location);
				this.currentLocationSource = action;
			} else {
				this.marker.hide();
				this.currentLocationSource = null;
			}
		};

		Person.prototype.progressLocation = function(action) {

			if (this.currentLocationSource === null || action.sampleTime > this.currentLocationSource.sampleTime) {
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
				console.log(action.message);
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

		function PersonSet (map) {
			this.people = [];
			this.map = map;
		}

		PersonSet.prototype.putPerson = function(id, name) {

			var person = new Person(id, map, name);
			this.people.push(person);
		};

		PersonSet.prototype.getPersonById = function(id) {
			
			for (var i=0; i<this.people.length; i++) {
				var person = this.people[i];
				if ( person.id === id ) {
					return person;
				}
			}

			// If we get to this point, that means there is no Person instance with that id
			var person = new Person(id, this.map);
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


	window['PersonSet'] = PersonSet; // <-- Constructor
	window['PersonSet'].prototype['putPerson'] = PersonSet.prototype.putPerson;
	window['PersonSet'].prototype['registerAction'] = PersonSet.prototype.registerAction;

	window['Person'] = Person; // <-- Constructor
	window['Person'].prototype['updateOnAction'] = Person.prototype.updateOnAction;

})();
