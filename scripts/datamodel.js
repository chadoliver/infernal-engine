(function() {


	var Location = (function () {

		function Location (latitude, longitude) {

			this.latitude = latitude;
			this.longitude = longitude;

			this.listeners = [];
			this.isActive = false;
			this.sampleTime = null;		// this is the sample time that the event becomes active.
		};

		Location.prototype.toGoogle = function() {
			return new google.maps.LatLng(this.latitude, this.longitude);
		};

		Location.prototype.updateOnInstant = function(instant) {

			this.isActive = instant.isActive;
			this.sampleTime = instant.sampleTime;

			for (var i=0; i<this.listeners.length; i++) {
				this.listeners[i].updateOnLocation(this);
			}
		}

		Location.prototype.registerListener = function(listener) {
			this.listeners.push(listener);
		};

		return Location;
	})();


	//===========================================================================================================//


	var Message = (function() {
		// a descriptive comment ...

		function UUID () {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			    return v.toString(16);
			});
		};
	
		function Message(text, name) {
			
			this.text = text;
			this.id = UUID();
			this.name = name;

			this.isActive = false;
			this.listeners = [];
			this.sampleTime = null;
			this.dependencies = {
				marker: null,
				instant: null,
			};
		}

		Message.prototype.updateOnInstant = function(instant) {
			this.dependencies.instant = instant;
			this.sampleTime = instant.sampleTime;
			this.notifyListeners();
		};
	
		Message.prototype.updateOnMarker = function(marker) {
			this.dependencies.marker = marker;
			this.notifyListeners();
		};

		Message.prototype.notifyListeners = function() {

			var instantIsActive = false;	// initially, all instants are in the future.
			var markerIsActive = true;		// initially, all markers are active.

			if (this.dependencies.instant !== null) {
				instantIsActive = this.dependencies.instant.isActive;
			}
			if (this.dependencies.marker !== null) {
				markerIsActive = this.dependencies.marker.isActive;
			}
			
			var newState = instantIsActive && markerIsActive;

			if (newState !== this.isActive) {
				this.isActive = newState;

				for (var i=0; i<this.listeners.length; i++) {
					this.listeners[i].updateOnMessage(this);
				}
			}
		};

		Message.prototype.registerListener = function(listener) {
			this.listeners.push(listener);
		};

		return Message;
	})();


	//===========================================================================================================//


	var Marker = (function() {
		// a descriptive comment ...

		function Marker(id, name, map) {
			// Marker represents a pointer thingy on the map. In our case, it is a visual representation of a person's
			// location at a given time.

			this.id = id;
			this.name = name;
			this.map = map;
			this.marker = null;		// an instance of google.maps.Marker();

			this.isActive  = true;
			this.listeners = [];

			this.locationHistory = [];
			this.currentLocation = null;
		}

		Marker.prototype.showAt = function(location) {
			
			if (location !== undefined) {				// if location is actually an instance of Location:

				this.currentLocation = location;

				if (this.marker === null) {
					this.marker = new google.maps.Marker({	// the marker doesn't exist, so we create it
					    position: location.toGoogle(),
					    map: this.map.map,					// this.map is an instance of Map(), while this.map.map is an instance of google.maps.Map().
					    title: this.id.toString(),
					    clickable: true,
					    icon: this.isActive ? 'img/green.png' : 'img/red.png'
					});
					google.maps.event.addListener(this.marker, 'click', this.onClick.bind(this));
				}
				else {
					this.marker.setPosition(location.toGoogle());	// the marker exists, so we just need to change its position.
				}
			}
		};

		Marker.prototype.progressLocation = function(location) {

			if (this.currentLocation === null) {
				this.showAt(location);
			} 
			else if (location.sampleTime > this.currentLocation.sampleTime) {
				this.showAt(location);
			}
			// else the action doesn't influence the current location, so we don't do anything.
		};

		Marker.prototype.regressLocation = function(location) {

			if (location === this.currentLocation) {

				// sort locationHistory into chronological order
				this.locationHistory.sort( function compare(a, b) {
					if (a.sampleTime < b.sampleTime) return -1;
					if (a.sampleTime > b.sampleTime) return 1;
					else return 0;
				});

				var i = this.locationHistory.length;
				while (i--) {
					if (this.locationHistory[i].isActive) {
						this.showAt(this.locationHistory[i]);
						return;
					}
				}

				// if we get this far, then there is no active action which specifies a location. Therefore, hide the marker.
				if (this.marker !== null) {
					this.marker.setMap(null);
					this.marker = null;
					this.currentLocation = null;
				}
			}
			// else the action doesn't influence the current location, so we don't do anything.
		};

		Marker.prototype.updateOnLocation = function(location) {

			if (location.isActive) {
				this.locationHistory.push(location);
				this.progressLocation(location);
			} 
			else {	// location has just become 'inactive'.
				var index = this.locationHistory.indexOf(location);
				if (index >= 0) {
					this.locationHistory.splice(index, 1);
				}
				this.regressLocation(location);
			}
		};

		Marker.prototype.onClick = function(event) {
			
			this.isActive = !this.isActive;

			if (this.isActive) {
				this.marker.setIcon('img/green.png');
			} else {
				this.marker.setIcon('img/red.png');
			}

			for (var i=0; i<this.listeners.length; i++) {
				this.listeners[i].updateOnMarker(this);
			}
		};

		Marker.prototype.registerListener = function(listener) {
			this.listeners.push(listener);
		};
	
		return Marker;
	})();


	//===========================================================================================================//


	var MarkerSet = (function() {

		function MarkerSet (map) {
			
			this.markers = [];
			this.map = map;
		}

		MarkerSet.prototype.createMarker = function(id, name) {

			var marker = new Marker(id, name, this.map);
			this.markers.push(marker);
		};

		MarkerSet.prototype.getMarkerById = function(id) {
			
			for (var i=0; i<this.markers.length; i++) {
				var marker = this.markers[i];
				if ( marker.id === id ) {
					return marker;
				}
			}

			// If we get to this point, that means there is no Person instance with that id
			var marker = new Marker(id, this.map);
			this.marker.push(marker);
			return marker;
		};

		return MarkerSet;
	})();


	//===========================================================================================================//


	var DataModel = (function() {
	
		function DataModel(timeController, markerSet, messageBoard, wordCloud) {
			
			this.markerSet = markerSet;
			this.timeController = timeController;
			this.messageBoard = messageBoard;
			this.wordCloud = wordCloud;
		}

		DataModel.prototype.createAction = function(text, coordinates, markerId, sampleTime) {

			var sampleInstant = new SampleInstant(sampleTime, this.timeController.zeroTime);
			var marker = this.markerSet.getMarkerById(markerId);

			this.timeController.registerListener(sampleInstant);

			if (coordinates !== null) {
				var location = new Location(coordinates[0], coordinates[1]);
				sampleInstant.registerListener(location);
				location.registerListener(marker);
			}
			
			if (text !== null) {
				var message = new Message(text, marker.name);
				sampleInstant.registerListener(message);
				marker.registerListener(message);
				message.registerListener(this.messageBoard);
				message.registerListener(this.wordCloud);
			}			
		};
	
		return DataModel;
	})();
	
	//===========================================================================================================//

	window['MarkerSet'] = MarkerSet;
	window['DataModel'] = DataModel;

})();
