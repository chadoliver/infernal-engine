var Action = (function () {
	
	function Action (personId, timestamp, location, message) {

		this.personId = personId;
		this.timestamp = timestamp;
		this.location = location;
		this.message = message;

		this.isActive = false;
		this.subscribers = [];
	}

	Action.prototype.activate = function() {
		
		if ( ! this.isActive) {
			this.isActive = true;
			console.log('activate');
			this.notifySubscribers();
		}
	};

	Action.prototype.deactivate = function() {
		
		if (this.isActive) {
			this.isActive = false;
			console.log('deactivate');
			this.notifySubscribers();
		}
	};

	Action.prototype.notifySubscribers = function() {

		for (var i=0; i<this.subscribers.length; i++) {
			this.subscribers[i].updateOnAction(this);
		}
	};

	Action.prototype.subscribe = function(subscriber) {
		this.subscribers.push(subscriber);
	};

	return Action;
})();
