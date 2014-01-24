var Map = (function() {
	// Map is a class which represents a google map (obviously). In this website, the Map forms the page's background.
	// If you've got a div called with the id 'map', then you can create a map instance with the code:
	//		var map = new Map('map', 'SATELLITE', 12, [-42.73, 171.69]);

	function Map(id, styleName, zoom, coordinates) {

		var element = document.getElementById(id);
		styleName = styleName || 'SATELLITE';
		zoom = zoom || 11;

		this.map = new google.maps.Map(element, {
			center: new google.maps.LatLng(-43.38, 171.22, false),
			zoom: zoom,
			mapTypeId: google.maps.MapTypeId[styleName],
			disableDefaultUI: true,
			rotateControl: true
		});
	}

	Map.prototype.changeStyle = function(styleName) {
		// Options: 'SATELLITE', 'HYBRID', 'ROADMAP'

		this.map.setMapTypeId(styleName);
	};

	Map.prototype.printPosition = function() {

		var center = this.map.getCenter();
		console.log('location:', center.toString());
		console.log('zoom:', this.map.getZoom());
	};

	return Map;
	
})();
