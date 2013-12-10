var Location = (function () {

	function Location (latitude, longitude) {
		this.latitude = latitude;
		this.longitude = longitude;
	};

	Location.prototype.difference = function(other) {
		var latitude = this.latitude - other.latitude;
        var longitude = this.longitude - other.longitude;
        return new Location(latitude, longitude);
	};

	Location.prototype.distance = function(other) {
		var dif = this.difference(other);
        var distance = Math.sqrt(dif.latitude*dif.latitude + dif.longitude*dif.longitude);
        return distance;
	};

	return Location;
})();


var Message = (function () {

	function Message (text) {
		this.text = text;
	};

	return Message;

})();


var Action = (function () {
	
	function Action (personId, timestamp, position, message) {

		this.personId = personId;
		this.timestamp = timestamp;
		this.position = position;
		this.message = message;
	}

	return Action;
})();