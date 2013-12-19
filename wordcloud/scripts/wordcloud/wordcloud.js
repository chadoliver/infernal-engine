(function() {


	var constants = {

		NUM_CHANNELS: 4,
		ALPHA_CHANNEL: 3,

		TEXT_BASELINE: 'top',
		BLUR_RADIUS: 10,

		ordering: {
			DISTANCE: 0,
			RANDOM: 1
		},

		whitePixels: {
			EXCLUDE: 0,
			INCLUDE: 1
		}
	};


	//===========================================================================================================//


	var Coordinate = (function() {

		/** @constructor */
		function Coordinate(x, y) {
			this.x = x;
			this.y = y;
		}

		Coordinate.prototype.apply = function(x, y) {
			// add a vector in place, instead of returning a new vector.

			if (y === undefined) {
				var other = x; // if y is undefined, we treat x like a coordinate
				this.x += other.x;
				this.y += other.y;
			} else {
				this.x += x;
				this.y += y;
			}

			return this; // to allow chaining.
		};

		Coordinate.prototype.sum = function(other) {
			var x = this.x + other.x;
			var y = this.y + other.y;
			return new Coordinate(x, y);
		};

		Coordinate.prototype.difference = function(other) {
			var x = this.x - other.x;
			var y = this.y - other.y;
			return new Coordinate(x, y);
		};

		Coordinate.prototype.distance = function(other) {
			var dif = this.difference(other);
			var distance = Math.sqrt(dif.x * dif.x + dif.y * dif.y);
			return distance;
		};

		Coordinate.prototype.paint = function(canvas) {
			canvas.context.fillStyle = 'red';
			canvas.context.fillRect(this.x, this.y, 1, 1);
		};

		return Coordinate;
	})();


	//===========================================================================================================//


	var CoordinateSet = (function() {

		function orderByDistance(coordinates, center) {

			coordinates.sort(function compare(a, b) {
				var distanceA = a.distance(center);
				var distanceB = b.distance(center);

				if (distanceA < distanceB) return -1;
				if (distanceA > distanceB) return 1;
				else return 0;
			});

			return coordinates;
		}

		function randomize(coordinates) {

			var currentIndex = coordinates.length;
			var temporaryValue = null;
			var randomIndex = null;

			while (currentIndex !== 0) {
				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;

				// And swap it with the current element.
				temporaryValue = coordinates[currentIndex];
				coordinates[currentIndex] = coordinates[randomIndex];
				coordinates[randomIndex] = temporaryValue;
			}

			return coordinates;
		}

		/** @constructor */
		function CoordinateSet(image) {
			this.coordinates = [];
			this.width = image.width;
			this.height = image.height;
			this.image = image;

			for (var y = 0; y < image.height; y++) {
				for (var x = 0; x < image.width; x++) {
					var coordinate = new Coordinate(x, y);
					this.coordinates.push(coordinate);
				}
			}
		}

		CoordinateSet.prototype.filter = function(coordinates, whitePixels) {
			var coordinates = [];

			if (whitePixels === constants.whitePixels.EXCLUDE) {
				for (var i = 0; i < this.coordinates.length; i++) {
					var coordinate = this.coordinates[i];
					if (this.image.getPixel(coordinate) > 0) {
						coordinates.push(coordinate);
					}
				}
			} else {
				coordinates = this.coordinates;
			}

			return coordinates;
		};

		CoordinateSet.prototype.getOrderedCoordinates = function(orderType, ignoreWhitePixels) {

			var coordinates = this.filter(this.coordinates, ignoreWhitePixels);

			if (orderType === constants.ordering.DISTANCE) {
				var center = new Coordinate(this.width / 2, this.height / 2);
				return orderByDistance(coordinates, center);
			} else {
				return randomize(coordinates);
			}
		};

		return CoordinateSet;
	})();


	//===========================================================================================================//


	var Image = (function() {

		/** @constructor */
		function Image(imageData) {
			this.raw = imageData;
			this.data = imageData.data;
			this.width = imageData.width;
			this.height = imageData.height;

			this.coordinateSet = new CoordinateSet(this);
		}

		Image.prototype.getPixel = function(coordinate) {
			// we only return the alpha value, on the assumption that all colored pixels must have a
			// non-zero alpha value.
			var pixelIndex = constants.NUM_CHANNELS * (coordinate.y * this.width + coordinate.x);
			var alpha = this.data[pixelIndex + constants.ALPHA_CHANNEL];
			return alpha;
		};

		Image.prototype.getOrderedCoordinates = function(orderType, ignoreWhitePixels) {
			return this.coordinateSet.getOrderedCoordinates(orderType, ignoreWhitePixels);
		};

		return Image;
	})();


	//===========================================================================================================//


	var Canvas = (function() {

		/** @constructor */
		function Canvas(width, height) {
			this.element = document.createElement("canvas");
			this.element.width = width;
			this.element.height = height;
			this.parent = null;

			this.context = this.element.getContext('2d');
		}

		Canvas.prototype.attach = function(parentId) {
			var parent = document.getElementById(parentId);
			parent.appendChild(this.element);

			this.parent = parentId;

			return this;
		};

		Canvas.prototype.clear = function() {
			this.context.clearRect(0, 0, this.element.width, this.element.height);
		};

		Canvas.prototype.writeText = function(text, size, blur, fontWeight, fontName, position) {

			if (position === undefined) position = new Coordinate(0, 0);

			this.context.textBaseline = constants.TEXT_BASELINE;
			this.context.font = fontWeight.toString() + ' ' + size.toString() + 'px ' + fontName;
			this.context.shadowColor = 'black';

			if (blur) this.context.shadowBlur = constants.BLUR_RADIUS;
			else this.context.shadowBlur = 0;

			this.context.fillText(text, position.x, position.y);
		};

		Canvas.prototype.writeImage = function(image, position) {
			// position is a Coordinate which specifies the *center* of the image, but putImageData() expect that position indicates the *top left* corner.
			var x = position.x - image.width / 2;
			var y = position.y - image.height / 2;
			var topLeft = new Coordinate(x, y);

			this.context.putImageData(image.raw, topLeft.x, topLeft.y);
		};

		Canvas.prototype.readImage = function(bbox) {
			var imageData;

			if (bbox === undefined) {
				// make an Image from the whole canvas
				imageData = this.context.getImageData(0, 0, this.element.width, this.element.height);
			} else {
				// make an Image from the area defined by bbox
				imageData = this.context.getImageData(bbox.start.x, bbox.start.y, bbox.width + 1, bbox.height + 1);
			}

			return new Image(imageData);
		};

		return Canvas;
	})();


	//===========================================================================================================//


	var BoundingBox = (function() {

		/** @constructor */
		function BoundingBox(image) {
			this.start = new Coordinate(Infinity, Infinity);
			this.end = new Coordinate(-Infinity, -Infinity);

			for (var y = 0; y < image.height; y++) {
				for (var x = 0; x < image.width; x++) {
					var alpha = image.getPixel(new Coordinate(x, y));

					if (alpha > 0) {
						this.start.x = Math.min(this.start.x, x);
						this.start.y = Math.min(this.start.y, y);
						this.end.x = Math.max(this.end.x, x);
						this.end.y = Math.max(this.end.y, y);
					}
				}
			}

			this.width = this.end.x - this.start.x;
			this.height = this.end.y - this.start.y;
		}

		BoundingBox.prototype.paint = function(canvas, color) {
			canvas.context.strokeStyle = color;
			canvas.context.strokeRect(this.start.x, this.start.y, this.width, this.height);
		};

		return BoundingBox;
	})();


	//===========================================================================================================//


	var Background = (function() {

		/** @constructor */
		function Background(id, width, height) {
			this.canvas = new Canvas(width, height).attach(id);
			this.image = this.readImage();
		}

		Background.prototype.readImage = function() {
			return this.canvas.readImage();
		};

		Background.prototype.readPixel = function(position) {
			return this.image.getPixel(position);
		};

		Background.prototype.writeImage = function(image, position) {
			this.canvas.writeImage(image, position);
			this.image = this.readImage();
		};

		Background.prototype.writeText = function(text, size, blur, fontWeight, fontName, position) {
			this.canvas.writeText(text, size, blur, fontWeight, fontName, position);
			this.image = this.readImage();
		};

		Background.prototype.clear = function() {
			this.canvas.clear();
		};

		Background.prototype.intersection = function(subjectCoordinates, offset) {

			for (var i = 0; i < subjectCoordinates.length; i++) {

				var coordinate = subjectCoordinates[i].sum(offset);
				var pixel = this.readPixel(coordinate);

				if (pixel !== 0) {
					return true;
				}
			}

			// if we get this far, then there was no intersection between the wordcloud and the image.
			return false;
		};

		Background.prototype.getOrderedCoordinates = function() {
			return this.image.getOrderedCoordinates(constants.ordering.DISTANCE, constants.whitePixels.INCLUDE);
		};

		return Background;
	})();


	//===========================================================================================================//


	var Word = (function() {

		var getImage = function(text, size, isBlurred, fontWeight, fontName) {
			var canvas = new Canvas(600, 200);
			canvas.writeText(text, size, isBlurred, fontWeight, fontName);
			var fullImage = canvas.readImage();
			var bbox = new BoundingBox(fullImage);
			return canvas.readImage(bbox);
		};

		/** @constructor */
		function Word(text, frequency, fontWeight, fontName) {
			var self = this;
			var size = 10 + 3 * frequency;

			this.text = text;
			this.frequency = frequency;
			/** @private */
			this.draftImage = getImage(text, size, true, fontWeight, fontName); // get a blurred image that we use to find the word's position.
			/** @private */
			this.finalImage = getImage(text, size, false, fontWeight, fontName); // get a normal image that we'll display in the wordcloud.
		}

		/** @private */
		Word.prototype.getOrderedCoordinates = function() {
			return this.draftImage.getOrderedCoordinates(constants.ordering.RANDOM, constants.whitePixels.EXCLUDE);
		};

		/** @private */
		Word.prototype.findPosition = function(background) {
			var componentCoordinates = this.getOrderedCoordinates(); // this is a list of all coordinates for black pixels in this.image, in random order.
			var candidatePositions = background.getOrderedCoordinates(); // this is a list of all coordinates for pixels in background.image, ordered by distance from the center.

			for (var i = 0; i < candidatePositions.length; i++) {
				var position = candidatePositions[i];

				var x = Math.floor(position.x - this.draftImage.width / 2);
				var y = Math.floor(position.y - this.draftImage.height / 2);
				var offset = new Coordinate(x, y);

				if (!background.intersection(componentCoordinates, offset)) {
					return position;
				}
			}
			return new Coordinate(300, 300);
		};

		Word.prototype.paint = function(background) {
			var position = this.findPosition(background);
			console.log(position.x, position.y);
			background.writeImage(this.finalImage, position);
		};

		return Word;
	})();


	//===========================================================================================================//


	var WordCloud = (function() {

		/** @constructor */
		function WordCloud(id, fontweight, fontname) {

			var width = 350;
			var height = 300;

			/** @private */ this.fontweight = fontweight;
			/** @private */ this.fontname = fontname;
			/** @private */ this.bg = new Background(id, width, height);

			this.words = [];
		}

		WordCloud.prototype.putWord = function(text, frequency) {

			if ((text === undefined) || (frequency === undefined)) {
				console.error('insufficient arguments');
				return;
			}

			var word = new Word(text, frequency, this.fontweight, this.fontname);
			this.words.push(word);
		};

		WordCloud.prototype.paint = function() {
			for (var i = 0; i < this.words.length; i++) {
				this.words[i].paint(this.bg);
			}
		};

		return WordCloud;
	})();

	window['WordCloud'] = WordCloud; // <-- Constructor
	window['WordCloud'].prototype['paint'] = WordCloud.prototype.paint;
	window['WordCloud'].prototype['putWord'] = WordCloud.prototype.putWord;

})();
