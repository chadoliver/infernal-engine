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
		action.subscribe( this.updateOnEvent.bind(this) );
		this.updateOnAction(action);
	};

	Person.prototype.updateOnAction = function(action) {
		
		if (action.isActive) {
			console.log(action.message.text);
		};
	};

	return Person;
})();
