(function() {

	var Map = (function() {
		// a descriptive comment ...
	
		function Map(styleName, zoom, coordinates) {

			styleName = styleName || 'SATELLITE';
			zoom = zoom || 11;
			coordinates = coordinates || [-43.38, 171.22];

			this.map = new google.maps.Map(document.getElementById('map'), {
			    center: google.maps.LatLng(coordinates[0], coordinates[1]),
			    zoom: zoom,
			    mapTypeId: google.maps.MapTypeId[styleName],
			    disableDefaultUI: true,
			    rotateControl: true,
			});
		}

		Map.prototype.changeStyle = function(styleName) {
			// Options: 'SATELLITE', 'HYBRID', 'ROADMAP'

			this.map.setMapTypeId(styleName);
		};

		Map.prototype.printPosition = function() {
			
			var center = this.map.getCenter()
			console.log('location:', center.toString());
			console.log('zoom:', this.map.getZoom());
		};
	
		return Map;
	})();


	//===========================================================================================================//
	
	// The google closure compiler obfuscates the names of classes, properties, and methods. However, it doesn't alter
	// string literals. We therefore use the following method to ensure that the necessary tokens are available to the
	// outside world.

	
	window['Map'] = Map; // <-- Constructor

})();
