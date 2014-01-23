"use strict";

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
		},

		NUM_ROUNDS: 30,
		INTERSECTION_CHECK_GAP: 1,
	};


	//===========================================================================================================//


	var Coordinate = (function() {

		/** @constructor */
		function Coordinate(x, y, center) {
			if (y === undefined) {
				this.x = x.x;
				this.y = x.y;
			} else {
				this.x = x;
				this.y = y;
			}

			if (center !== undefined) {
				var deltaX = (this.x - center.x) * constants.HORIZONTAL_SCALING_FACTOR;
				var deltaY = (this.y - center.y) * constants.VERTICAL_SCALING_FACTOR;
				this.distanceToCenter = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
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

		Image.prototype.getPixel = function(x, y) {
			// we only return the alpha value, on the assumption that all colored pixels must have a
			// non-zero alpha value.
			var pixelIndex = constants.NUM_CHANNELS * (y * this.width + x);
			var alpha = this.data[pixelIndex + constants.ALPHA_CHANNEL];
			return alpha;
		};

		Image.prototype.getCoordinates = function(whitePixels) {

			var coordinates = [];

			for (var y = 0; y < this.height; y++) {
				for (var x = 0; x < this.width; x++) {
					if (whitePixels == constants.whitePixels.EXCLUDE) {
						var pixelIndex = constants.NUM_CHANNELS * (y * this.width + x);
						var alpha = this.data[pixelIndex + constants.ALPHA_CHANNEL];
						if (alpha > 0) {
							coordinates.push( new Coordinate(x, y));
						}
					} else {
						coordinates.push( new Coordinate(x, y));
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

			if (position === undefined) {
				position = new Coordinate(0, 0);
			}

			this.context.textBaseline = constants.TEXT_BASELINE;
			this.context.font = fontWeight.toString() + ' ' + size.toString() + 'px ' + fontName;
			this.context.shadowColor = 'black';

			if (isBlurred) this.context.shadowBlur = constants.BLUR_RADIUS;
			else this.context.shadowBlur = 0;

			this.context.fillText(text, position.x, position.y);

			return this.context.measureText(text).width;
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
		function Background(width, height, id, generateCoordinates) {
			this.width = width;
			this.height = height;

			this.canvas = new Canvas(width, height);

			if (id !== undefined) {
				this.canvas.attach(id);
			}

			if (generateCoordinates) this.coordinates = this.getCoordinates();
			this.image = this.readImage();
		};

		Background.prototype.readImage = function() {
			return this.canvas.readImage();
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

		Background.prototype.binarize = function() {
			
			for (var i=0; i<this.coordinates.length; i++) {
				var coordinate = this.coordinates[i];
				var pixel = this.image.getPixel(coordinate.x, coordinate.y);
				if (pixel !== 0) {
					var pixelIndex = constants.NUM_CHANNELS * (coordinate.y*this.width + coordinate.x);
					this.image.data[pixelIndex+constants.ALPHA_CHANNEL] = 255;
				}
			}
			this.canvas.context.putImageData(this.image.raw, 0, 0);
		};

		Background.prototype.clear = function() {
			this.canvas.clear();
			this.image = this.readImage();
		};

		Background.prototype.intersection = function(topLeft, width, height) {

			var arrayLength = width*height;
			var numRounds = Math.max(10, Math.floor(arrayLength/5));

			for (var pixelSet=0; pixelSet<numRounds; pixelSet++) {
				for (var i=pixelSet; i<arrayLength; i=i+numRounds) {

					var x = (i%width) + topLeft.x;
					var y = Math.floor(i/width) + topLeft.y;

					if (this.image.getPixel(x, y) !== 0) {
						return true;
					}
				}
			}

			// if we get this far, then there was no intersection between the wordcloud and the image.
			return false;
			
		};

		Background.prototype.getCoordinates = function() {
			// Return a list of all coordinates (effectively, pixels) in the image, ordered by distance from the center

			var coordinates = new Array(this.height*this.width);
			var center = new Coordinate(this.width/2, this.height/2);

			for (var y = 0; y < this.height; y++) {
				for (var x = 0; x < this.width; x++) {
					coordinates[y*this.width + x] = new Coordinate(x, y, center);
				}
			}

			coordinates.sort(function compare(a, b) {
				if (a.distanceToCenter < b.distanceToCenter) return -1;
				if (a.distanceToCenter > b.distanceToCenter) return 1;
				else return 0;
			});	

			return coordinates;	
		};


		return Background;
	})();


	//===========================================================================================================//


	var BoundingBox = (function() {

		/** @constructor */
		function BoundingBox(image, width) {

			var xMin = 0;				// The word is written at the position [0,0], thus xMin must be 0. Sadly, yMin is not guaranteed to also be 0.
			var xMax = width;			// Derived from ctx.measureText(text).width

			var yMin = image.height;	// Guaranteed to be bigger than the real value.
			var yMax = 0;				// Guaranteed to be smaller than the real value.

			for (var y = 0; y < image.height; y += 1) {
				for (var x = xMin; x < xMax; x += 2) {
					
					var alpha = image.getPixel(x, y);

					if (alpha > 0) {
						yMin = Math.min(yMin, y);
						yMax = Math.max(yMax, y);
						break;	// we're only concerned with height (y-value), so after we've found one black pixel in the row we can skip to the next row.
					}
				}
			}

			this.start = new Coordinate(xMin, yMin);
			this.end = new Coordinate(xMax, yMax);

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

		function Word(text, frequency, fontWeight, fontName) {
			var self = this;

			this.text = text;
			this.size = constants.TEXT_SIZE_CONSTANT + constants.TEXT_SIZE_MULTIPLIER * frequency;
			this.fontWeight = fontWeight;
			this.fontName = fontName;

			this.image = undefined;
			this.bbox = undefined;
		}

		Word.prototype.generateImage = function() {
			// This function should be called every time the word's frequency changes.

			var canvas = new Canvas(600, 200);
			var width = canvas.writeText(this.text, this.size, false, this.fontWeight, this.fontName);
			var fullImage = canvas.readImage();
			this.bbox = new BoundingBox(fullImage, width);
			this.image = canvas.readImage(this.bbox);
		};

		Word.prototype.findPosition = function(draftBackground) {
			
			this.generateImage();

			// Iterate through all possible positions where the word could be placed, and return the first position 
			// which doesn't cause the word to intersect with any other words. Note that the possible positions are
			// ordered by distance to the center (closest first) so the *first* non-intersecting position will also be 
			// the *most central* non-intersecting position.
			var position = null;
			var len = draftBackground.coordinates.length;

			for (var i = 0; i < len; i=i+3) {
				var candidate = draftBackground.coordinates[i];

				var x = Math.floor(candidate.x - this.image.width / 2);
				var y = Math.floor(candidate.y - this.image.height / 2);
				var topLeft = new Coordinate(x, y);

				if (!draftBackground.intersection(topLeft, this.image.width, this.image.height)) {
					position = candidate;
					break;
				}
			}

			if (position === null) {
				// the default position is the center of the image.
				var x = Math.floor(draftBackground.width / 2); // - bbox.start.x - image.width/2
				var y = Math.floor(draftBackground.height / 2); // - bbox.start.y - image.height/2
				var position = new Coordinate(x, y);
			}

			return position;
		};

		Word.prototype.paint = function(draftBackground, finalBackground) {

			var wordCenter = this.findPosition(draftBackground);

			var position = {
				x: wordCenter.x - this.bbox.width / 2 - this.bbox.start.x,
				y: wordCenter.y - this.bbox.height / 2 - this.bbox.start.y
			};

			var continueTime = Date.now();

			draftBackground.writeText(this.text, this.size, true, this.fontWeight, this.fontName, position);
			finalBackground.writeText(this.text, this.size, false, this.fontWeight, this.fontName, position);
		};

		return Word;
	})();


	//===========================================================================================================//

	var DeferredProcessor = (function() {
		// a descriptive comment ...
	
		function DeferredProcessor() {
			
			this.queue = [];
			this.timeout = null;
		}

		DeferredProcessor.prototype.process = function() {

			var item = this.queue.shift();	// dequeue one job
			item.job.apply(item.context, item.args);

			if (this.queue.length === 0) {
				this.timeout = null;
			} else {
				this.timeout = setTimeout(this.process.bind(this), 0);
			}
		};

		DeferredProcessor.prototype.push = function(job, context, args) {

			this.queue.push({
				job: job, 
				context: context,
				args: args,
			});

			if (this.timeout === null) {
				this.timeout = setTimeout(this.process.bind(this), 0);
			}
		};
	
		return DeferredProcessor;
	})();

	//===========================================================================================================//

	var WordCloud = (function() {

		/** @constructor */
		function WordCloud(id, fontweight, fontname) {

			var width = 350;
			var height = 250;

			this.fontweight = fontweight;
			this.fontname = fontname;

			this.draftBackground = new Background(width, height, undefined, true);
			this.finalBackground = new Background(width, height, 'wordcloud');

			this.words = [];
			this.deferredProcessor = new DeferredProcessor();
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

			// queue actions to clear this.draftBackground and this.finalBackground.
			this.deferredProcessor.push(this.draftBackground.clear, this.draftBackground);
			this.deferredProcessor.push(this.finalBackground.clear, this.finalBackground);

			for (var i=0; i<this.words.length; i++) {
				var word = this.words[i];
				this.deferredProcessor.push(word.paint, word, [this.draftBackground, this.finalBackground]);
			}
		};

		WordCloud.prototype.test = function(numIterations) {
			
			for (var i=0; i<numIterations; i++) {
				this.paint();
			}			
		};

		WordCloud.prototype.updateOnMessage = function(message) {
			//console.log('wordcloud: received message');
		};

		return WordCloud;
	})();

	window['WordCloud'] = WordCloud;
})();
