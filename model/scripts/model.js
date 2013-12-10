var Model = (function () {
	
	function Model (actions) {

		this.timeLord = new TimeLord();
		this.people = new PersonSet();
		
		for (var i=0; i<actions.length; i++) {
			this.people.registerAction( actions[i] );
		}

	}

	return Model;
})();