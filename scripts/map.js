(function() {

	var Map = (function() {
		// a descriptive comment ...
	
		function Map(styleName, zoom, location) {

			styleName = styleName || 'SATELLITE';
			zoom = zoom || 11;
			location = location || new Location(-43.38, 171.22)

			this.map = new google.maps.Map(document.getElementById('map'), {
			    center: location.toGoogle(),
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
	window['Map']['map'] = Map.map;
	window['Map']['changeStyle'] = Map.changeStyle;
	window['Map']['printPosition'] = Map.printPosition;


	//===========================================================================================================//

	/*
	var markers = [
	    new google.maps.Marker({
	        position: new google.maps.LatLng(-43.38, 171.22),
	        map: map,
	        title: 'Tim'
	    }),
	    new google.maps.Marker({
	        position: new google.maps.LatLng(-43.43, 171.18),
	        map: map,
	        title: 'Jerry'
	    }),
	    new google.maps.Marker({
	        position: new google.maps.LatLng(-43.41, 171.33),
	        map: map,
	        title: 'Russel'
	    }),
	    new google.maps.Marker({
	        position: new google.maps.LatLng(-43.415, 171.34),
	        map: map,
	        title: 'Russel'
	    })
	];
	*/

})();
