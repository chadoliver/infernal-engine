(function() {


	var constants = {

		NUM_CHANNELS: 4,
		ALPHA_CHANNEL: 3,

		TEXT_SIZE_CONSTANT: 10,
		TEXT_SIZE_MULTIPLIER: 3,
		TEXT_BASELINE: 'top',
		BLUR_RADIUS: 8,

		HORIZONTAL_SCALING_FACTOR: 1,
		VERTICAL_SCALING_FACTOR: 1.5,

		whitePixels: {
			EXCLUDE: 0,
			INCLUDE: 1
		}
	};


	//===========================================================================================================//


	var Coordinate = (function() {

		/** @constructor */
		function Coordinate(x, y) {
			if (y === undefined) {
				this.x = x.x;
				this.y = x.y;
			} else {
				this.x = x;
				this.y = y;
			}
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
			var deltaX = (this.x - other.x) * constants.HORIZONTAL_SCALING_FACTOR;
			var deltaY = (this.y - other.y) * constants.VERTICAL_SCALING_FACTOR;

			var distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
			return distance;
		};

		Coordinate.prototype.paint = function(canvas) {
			canvas.context.fillStyle = 'red';
			canvas.context.fillRect(this.x - 1, this.y - 1, 3, 3);
		};

		return Coordinate;
	})();

	//===========================================================================================================//

	var Image = (function() {

		/** @constructor */
		function Image(imageData) {
			this.raw = imageData;
			this.data = imageData.data;
			this.width = imageData.width;
			this.height = imageData.height;
		}

		Image.prototype.getPixel = function(coordinate) {
			// we only return the alpha value, on the assumption that all colored pixels must have a
			// non-zero alpha value.
			var pixelIndex = constants.NUM_CHANNELS * (coordinate.y * this.width + coordinate.x);
			var alpha = this.data[pixelIndex + constants.ALPHA_CHANNEL];
			return alpha;
		};

		Image.prototype.getCoordinates = function(whitePixels) {

			coordinates = [];

			for (var y = 0; y < this.height; y++) {
				for (var x = 0; x < this.width; x++) {
					if (whitePixels == constants.whitePixels.EXCLUDE) {
						var pixelIndex = constants.NUM_CHANNELS * (y * this.width + x);
						var alpha = this.data[pixelIndex + constants.ALPHA_CHANNEL];
						if (alpha > 0) {
							coordinates.push(new Coordinate(x, y));
						}
					} else {
						coordinates.push(new Coordinate(x, y));
					}
				}
			}

			return coordinates;
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

		Canvas.prototype.writeText = function(text, size, isBlurred, fontWeight, fontName, position) {

			if (position === undefined) position = new Coordinate(0, 0);

			this.context.textBaseline = constants.TEXT_BASELINE;
			this.context.font = fontWeight.toString() + ' ' + size.toString() + 'px ' + fontName;
			this.context.shadowColor = 'black';

			if (isBlurred) this.context.shadowBlur = constants.BLUR_RADIUS;
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

	var Background = (function() {

		/** @constructor */
		function Background(width, height, id) {
			this.width = width;
			this.height = height;

			this.canvas = new Canvas(width, height);
			if (id !== undefined) {
				this.canvas.attach(id);
			}

			this.image = this.readImage();
		};

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

		Background.prototype.writeText = function(text, size, isBlurred, fontWeight, fontName, position) {
			this.canvas.context.fillStyle = 'black';
			this.canvas.writeText(text, size, isBlurred, fontWeight, fontName, position);
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

		Background.prototype.getCoordinates = function() {
			// Return a list of all coordinates (effectively, pixels) in the image. The list is ordered by closeness to the center, 
			// with a small bias to favour pixels closer to the vertical middle of the image.

			coordinates = this.image.getCoordinates(constants.whitePixels.INCLUDE);

			// sort the coordinates by closeness to the center
			var center = new Coordinate(this.width / 2, this.height / 2);
			coordinates.sort(function compare(a, b) {
				var distanceA = a.distance(center);
				var distanceB = b.distance(center);

				if (distanceA < distanceB) return -1;
				if (distanceA > distanceB) return 1;
				else return 0;
			});

			return coordinates;
		};

		return Background;
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

			this.text = text;
			this.size = constants.TEXT_SIZE_CONSTANT + constants.TEXT_SIZE_MULTIPLIER * frequency;
			this.fontWeight = fontWeight;
			this.fontName = fontName;
		}

		/** @private */
		Word.prototype.findPosition = function(background) {

			var position = null;

			var canvas = new Canvas(600, 200);
			canvas.writeText(this.text, this.size, false, this.fontWeight, this.fontName);
			var fullImage = canvas.readImage();
			var bbox = new BoundingBox(fullImage);
			var image = canvas.readImage(bbox);

			var componentCoordinates = image.getCoordinates(constants.whitePixels.EXCLUDE); // this is a list of all coordinates for black pixels in this.image
			var candidatePositions = background.getCoordinates(); // this is a list of all coordinates for pixels in background.image, ordered by distance from the center.

			// Iterate through all possible positions where the word could be placed, and return the first position 
			// which doesn't cause the word to intersect with any other words. Note that the possible positions are
			// ordered by distance to the center (closest first) so the *first* non-intersecting position will also be 
			// the *most central* non-intersecting position.
			var len = candidatePositions.length;
			for (var i = 0; i < len; i++) {
				var candidate = candidatePositions[i];

				var x = Math.floor(candidate.x - image.width / 2);
				var y = Math.floor(candidate.y - image.height / 2);
				var topLeft = new Coordinate(x, y);

				if (!background.intersection(componentCoordinates, topLeft)) {
					position = candidate;
					break;
				}
			}

			if (position === null) {
				// the default position is the center of the image.
				var x = Math.floor(background.width / 2); // - bbox.start.x - image.width/2
				var y = Math.floor(background.height / 2); // - bbox.start.y - image.height/2
				var position = new Coordinate(x, y);
			}

			return {
				wordCenter: position,
				boundingBox: bbox
			};
		};

		Word.prototype.paint = function(draftBackground, finalBackground) {

			var retval = this.findPosition(draftBackground);
			var wordCenter = retval.wordCenter;
			var boundingBox = retval.boundingBox;

			var position = {
				x: wordCenter.x - boundingBox.width / 2 - boundingBox.start.x,
				y: wordCenter.y - boundingBox.height / 2 - boundingBox.start.y
			};

			draftBackground.writeText(this.text, this.size, true, this.fontWeight, this.fontName, position);
			finalBackground.writeText(this.text, this.size, false, this.fontWeight, this.fontName, position);
		};

		return Word;
	})();


	//===========================================================================================================//


	var WordCloud = (function() {

		/** @constructor */
		function WordCloud(id, fontweight, fontname) {

			var width = 350;
			var height = 250;

			/** @private */
			this.fontweight = fontweight;
			/** @private */
			this.fontname = fontname;

			/** @private */
			this.draftBackground = new Background(width, height, undefined);
			/** @private */
			this.finalBackground = new Background(width, height, 'wordcloud');

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
				var word = this.words[i];
				word.paint(this.draftBackground, this.finalBackground);
			}
		};

		return WordCloud;
	})();

	window['WordCloud'] = WordCloud; // <-- Constructor
	window['WordCloud'].prototype['paint'] = WordCloud.prototype.paint;
	window['WordCloud'].prototype['putWord'] = WordCloud.prototype.putWord;

})();
