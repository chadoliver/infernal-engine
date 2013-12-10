var ActionSource = (function () {
	
	function ActionSource (actions) {
		this.actions = actions;

		// sort actions in this.actions by their timestamp.
		this.actions.sort( function compare(a, b) {
	        if (a.timestamp < b.timestamp) return -1;
	        if (a.timestamp > b.timestamp) return 1;
	        else return 0;
	    });
	}

	ActionSource.prototype.pop = function() {
		// return the event which happens next.

		return this.actions.pop();
	};

	return ActionSource;
})();