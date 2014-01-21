(function() {

	var MessageBoard = (function() {
		// a descriptive comment ...
	
		function MessageBoard(id) {
			
			id = id || 'messages';

			this.root = document.getElementById(id);
			this.messages = []; 	// all elements under this.root have an associated Message object stored in this list.
			this.listeners = [];
		}

		MessageBoard.prototype.createMessageElement = function(message) {

			var wrapperElement = document.createElement('div');
			var contentElement = document.createElement('div');

			wrapperElement.className = 'messageWrapper';
			wrapperElement.id = message.id;
			
			contentElement.className = 'messageContent';
			contentElement.innerHTML = message.name + ": " + message.text;

			wrapperElement.appendChild(contentElement);

			return wrapperElement;
		};

		MessageBoard.prototype.findSucceedingMessageElement = function(message) {

			// ensure that this.messages is sorted in chronological order.
			this.messages.sort( function compare(a, b) {
				if (a.sampleTime < b.sampleTime) return -1;
				if (a.sampleTime > b.sampleTime) return 1;
				else return 0;
			});

			// find the first message which has a bigger sampleTime (the new message will be inserted
			// directly before this message)
			
			var suceedingMessageElement = null;
			for (var i=0; i<this.messages.length; i++) {
				if (this.messages[i].sampleTime > message.sampleTime) {
					suceedingMessageElement = document.getElementById( this.messages[i].id );
					break;
				}
			}
			return suceedingMessageElement;
		};

		MessageBoard.prototype.publishMessage = function(message) {
			
			// first, we create the message element (which is actually two elements, one
			// inside the other).
			var messageElement = this.createMessageElement(message);

			// now, we need to insert the message element at the right place under this.root.
			var suceedingMessageElement = this.findSucceedingMessageElement(message);
			if (suceedingMessageElement === null) {
				this.root.appendChild(messageElement);
			} else {
				this.root.insertBefore(messageElement, suceedingMessageElement);
			}

			// and finally, we update this.messages so that it includes the new message.
			this.messages.push(message);
			
		};

		MessageBoard.prototype.retractMessage = function(message) {
			
			// first, remove the element from under this.root
			var wrapperElement = document.getElementById(message.id);
			if (wrapperElement !== null) {
				this.root.removeChild(wrapperElement);
			}

			// next, remove the associated message from this.messages.
			var index = this.messages.indexOf(message);
			if (index >= 0) {
				this.messages.splice(index, 1);
			}
		};

		MessageBoard.prototype.updateOnMessage = function(message) {

			if (message.isActive) {
				this.publishMessage(message);
			} 
			else {
				this.retractMessage(message);
			}
		};

		MessageBoard.prototype.registerListener = function(listener) {
			this.listeners.push(listener);
		};
	
		return MessageBoard;
	})();

	window['MessageBoard'] = MessageBoard;

})();
