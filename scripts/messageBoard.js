(function() {

	var MessageBoard = (function() {
		// a descriptive comment ...
	
		function MessageBoard(id) {
			
			id = id || 'messages';

			this.root = document.getElementById(id);
			this.listeners = [];
		}

		MessageBoard.prototype.publishMessage = function(message) {
			
			var wrapperElement = document.createElement('div');
			var contentElement = document.createElement('div');

			wrapperElement.className = 'messageWrapper';
			wrapperElement.id = message.id;
			
			contentElement.className = 'messageContent';
			contentElement.innerHTML = message.name + ": " + message;

			wrapperElement.appendChild(contentElement);
			this.rootElement.appendChild(wrapperElement);
		};

		MessageBoard.prototype.retractMessage = function(message) {
			
			var wrapperElement = document.getElementById(message.id);
			if (wrapperElement !== null) {
				this.root.removeChild(wrapperElement);
			}
		};

		MessageBoard.prototype.updateOnMessage = function(message) {

			if (message.isActive) {
				this.publishMessage(action);
			} 
			else {
				this.retractMessage(action);
			}
		};

		MessageBoard.prototype.registerListener = function(listener) {
			this.listeners.push(listener);
		};
	
		return MessageBoard;
	})();

	window['MessageBoard'] = MessageBoard;

})();
