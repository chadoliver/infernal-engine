(function() {


	var Marker = (function() {
		// a descriptive comment ...
	
		function Marker(map, initialLocation, person) {
			// Marker represents a pointer thingy on the map. In our case, it is a visual representation of a person's
			// location at a given time.

			this.map = map;
			this.location = initialLocation;
			this.person = person;

			this.marker = new google.maps.Marker({
			    position: new google.maps.LatLng(this.location.latitude, this.location.longitude),
			    map: this.map,
			    title: this.person.name
			}),

			
		}
	
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
