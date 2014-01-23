(function() {

	var RepresentativeImage = (function() {
		// a descriptive comment ...
	
		function RepresentativeImage(id, host) {
			
			id = id || 'thumbnail';

			this.element = document.getElementById(id);
			this.messages = [];
			
			this.websocket = new WebSocket("ws://" + host);
			this.websocket.onopen = this.onSocketOpen.bind(this);
			this.websocket.onclose = this.onSocketClosed.bind(this);
			this.websocket.onerror = this.onSocketError.bind(this);
			this.websocket.onmessage = this.onWebsocketResponse.bind(this);
			
			this.websocket.onerror = function (e) {
				console.log("Socket error:", e);
			};
		}

		RepresentativeImage.prototype.onSocketOpen = function(e) {
			console.log("Socket opened.");
		};

		RepresentativeImage.prototype.onSocketClosed = function (e) {
			console.log("Socket closed.");
		};

		RepresentativeImage.prototype.onSocketError = function (e) {
			console.log("Socket error:", e);
		};

		RepresentativeImage.prototype.onWebsocketResponse = function(json) {
			console.log("Socket message:", e.data);
			this.element.src = json.imageUrl;
		};

		RepresentativeImage.prototype.updateOnMessage = function(message) {

			if (message.isActive) {
				this.messages.push(message);
			} 
			else {
				// remove the associated message from this.messages.
				var index = this.messages.indexOf(message);
				if (index >= 0) {
					this.messages.splice(index, 1);
				}
			}


		};

		RepresentativeImage.prototype.registerListener = function(listener) {
			this.listeners.push(listener);
		};
	
		return RepresentativeImage;
	})();

	window['RepresentativeImage'] = RepresentativeImage;

})();
