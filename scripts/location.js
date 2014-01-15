(function() {

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

		Location.prototype.toGoogle = function() {
			return new google.maps.LatLng(this.latitude, this.longitude);
		};

		return Location;
	})();


	//===========================================================================================================//

	// The google closure compiler obfuscates the names of classes, properties, and methods. However, it doesn't alter
	// string literals. We therefore use the following method to ensure that the necessary tokens are available to the
	// outside world.

	window['Location'] = Location; // <-- Constructor

	window['Location']['latitude'] = Location.latitude;
	window['Location']['longitude'] = Location.longitude;
	
	window['Location']['toGoogle'] = Location.toGoogle;

})();
