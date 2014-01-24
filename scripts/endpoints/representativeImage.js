var RepresentativeImage = (function() {
	// RepresentativeImage is a class which manages the big image seen in the sidebar. This class is not finished! I've 
	// written the outline, but I haven't tested it at all.

	function RepresentativeImage(id, host) {
		
		id = id || 'thumbnail';

		this.element = document.getElementById(id);
		this.messages = [];
		this.requestNumber = 0;	// this is incremented and sent with each websocket request, so that we can detect 'stale' responses.
		
		/*
		// This code is commented out simply because I haven't had time to test it (or write the server).

		this.websocket = new WebSocket("ws://" + host);
		this.websocket.onopen = this.onSocketOpen.bind(this);
		this.websocket.onclose = this.onSocketClosed.bind(this);
		this.websocket.onerror = this.onSocketError.bind(this);
		this.websocket.onmessage = this.onWebsocketResponse.bind(this);
		*/
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

		/*
		// This code is commented out simply because I haven't had time to test it (or write the server).

		if (message.isActive) {
			this.messages.push(message.text);
		} 
		else {
			// remove the associated message from this.messages.
			var index = this.messages.indexOf(message.text);
			if (index >= 0) {
				this.messages.splice(index, 1);
			}
		}

		var request = {
			messages: this.messages,
			this.requestNumber++,
		}

		this.websocket.send(request);	// I'm pretty sure that request has to be converted to a string first.
		*/
	};

	RepresentativeImage.prototype.registerListener = function(listener) {
		this.listeners.push(listener);
	};

	return RepresentativeImage;
})();
