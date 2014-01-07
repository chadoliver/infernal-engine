var Model = (function () {
	
	function Model (actions) {

		this.clock = new Clock();
		this.people = new PersonSet();
		
		for (var i=0; i<actions.length; i++) {
			this.people.registerAction( actions[i] );
		}

	}

	return Model;
})();
