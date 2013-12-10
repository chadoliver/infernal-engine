var PersonSet = (function() {

	function PersonSet () {
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

	

})();