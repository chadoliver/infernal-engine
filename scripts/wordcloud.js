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

			var coordinates = new Array(this.height*this.width);

			for (var y = 0; y < this.height; y++) {
				for (var x = 0; x < this.width; x++) {
					if (whitePixels == constants.whitePixels.EXCLUDE) {
						var pixelIndex = constants.NUM_CHANNELS * (y * this.width + x);
						var alpha = this.data[pixelIndex + constants.ALPHA_CHANNEL];
						if (alpha > 0) {
							coordinates[y*this.width+x] = new Coordinate(x, y);
						}
					} else {
						coordinates[y*this.width+x] = new Coordinate(x, y);
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
		function Background(width, height, id, generateIndexArray) {
			this.width = width;
			this.height = height;

			this.canvas = new Canvas(width, height);

			if (id !== undefined) {
				this.canvas.attach(id);
			}
			if (generateIndexArray) {
				this.indexArray = this.getIndexArray(width, height);
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

			for (var i = 0; i < subjectCoordinates.length; i=i+3) {

				if (subjectCoordinates[i] !== undefined) {
					var coordinate = subjectCoordinates[i].sum(offset);
					var pixel = this.readPixel(coordinate);

					if (pixel !== 0) {
						return true;
					}
				}
			}

			// if we get this far, then there was no intersection between the wordcloud and the image.
			return false;
		};

		Background.prototype.getCoordinates = function() {
			// Return a list of all coordinates (effectively, pixels) in the image. This.indexArray may be used to 
			// access them in order of closeness to the center of the image.

			return this.image.getCoordinates(constants.whitePixels.INCLUDE);
		};

		Background.prototype.getIndexArray = function(width, height) {
			// the index array is a list of indices used as a substitute for sorting the coordinates returned 
			// by this.image.getCoordinates(). So, if we have:
			//
			// 		var coordinates = background.getCoordinates();
			//		var indexArray = background.getIndexArray();
			//
			// Then to access the coordinates as if they were sorted by distance from the center of the 
			// wordcloud, use:
			//
			// 		for (var i=0, i<indexArray.length; i++) {
			//			var coordinate = coordinates[indexArray[i]];
			//		}

			var startTime = Date.now();

			var draftArray = new Array(height*width);	// used to preserve temporary values through the sorting process
			var indexArray = new Array(height*width);

			var center =  {
				x: width/2,
				y: height/2
			};

			for (var y = 0; y < height; y++) {
				for (var x = 0; x < width; x++) {

					var deltaX = (x - center.x) * constants.HORIZONTAL_SCALING_FACTOR;
					var deltaY = (y - center.y) * constants.VERTICAL_SCALING_FACTOR;
					var distanceToCenter = Math.sqrt(deltaX*deltaX + deltaY*deltaY);

					var indexFromTopLeft = y*this.width+x;

					draftArray[indexFromTopLeft] = [distanceToCenter, indexFromTopLeft];
				}
			}

			draftArray.sort(function compare(a, b) {
				if (a[0] < b[0]) return -1;
				if (a[0] > b[0]) return 1;
				else return 0;
			});

			for (var i=0; i<(height*width); i++) {
				indexArray[i] = draftArray[i][1];
			}

			return indexArray;
		};

		return Background;
	})();


	//===========================================================================================================//


	var BoundingBox = (function() {

		totalTime = 0;

		/** @constructor */
		function BoundingBox(image, width) {

			// This function is almost always the largest part of Word.getImage();

			var startTime = Date.now();

			var xMin = 0;				// The word is written at the position [0,0], thus xMin must be 0. Sadly, yMin is not guaranteed to also be 0.
			var xMax = width;			// Derived from ctx.measureText(text).width
			var yMin = image.height;	// Guaranteed to be bigger than the real value.
			var yMax = 0;				// Guaranteed to be smaller than the real value.

			for (var y = 0; y < image.height; y += 1) {
				for (var x = xMin; x < xMax; x += 2) {
					
					var alpha = image.getPixel(new Coordinate(x, y));
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

			totalTime += Date.now()-startTime;
		}

		BoundingBox.prototype.paint = function(canvas, color) {
			canvas.context.strokeStyle = color;
			canvas.context.strokeRect(this.start.x, this.start.y, this.width, this.height);
		};

		return BoundingBox;
	})();


	//===========================================================================================================//


	var Word = (function() {

		function Word(text, fontWeight, fontName) {

			this.frequency = 0;
			this.frequencyIsDirty = false;

			this.image = undefined;
			this.bbox = undefined;

			this.text = text;
			this.fontWeight = fontWeight;
			this.fontName = fontName;
		}

		Word.prototype.incrementFrequency = function() {
			
			this.frequency++;
			this.frequencyIsDirty = true;
		};

		Word.prototype.decrementFrequency = function() {
			
			if (this.frequency > 0) {
				this.frequency--;
				this.frequencyIsDirty = true;
			}
		};

		Word.prototype.getSize = function() {
			var size = constants.TEXT_SIZE_CONSTANT + constants.TEXT_SIZE_MULTIPLIER * this.frequency;
			return size;
		};

		Word.prototype.generateImage = function() {
			// This function should be called when the word's frequency changes.

			var canvas = new Canvas(600, 200);
			var width = canvas.writeText(this.text, this.getSize(), false, this.fontWeight, this.fontName);
			var fullImage = canvas.readImage();
			
			this.bbox = new BoundingBox(fullImage, width);
			this.image = canvas.readImage(this.bbox);

			this.frequencyIsDirty = false;
		};

		Word.prototype.generatePosition = function(draftBackground) {	// should be passed draftBackground

			var componentCoordinates = this.image.getCoordinates(constants.whitePixels.EXCLUDE); // this is a list of all coordinates for black pixels in this.image
			var candidatePositions = draftBackground.getCoordinates(); // this is a list of all coordinates for pixels in background.image, ordered by distance from the center.
			var indexArray = draftBackground.indexArray;

			// Iterate through all possible positions where the word could be placed, and return the first position 
			// which doesn't cause the word to intersect with any other words. Note that the possible positions are
			// ordered by distance to the center (closest first) so the *first* non-intersecting position will also be 
			// the *most central* non-intersecting position.
			var position = null;
			var len = candidatePositions.length;
			for (var i = 0; i < len; i=i+3) {
				var candidate = candidatePositions[indexArray[i]];

				var x = Math.floor(candidate.x - this.image.width/2);
				var y = Math.floor(candidate.y - this.image.height/2);
				var topLeft = new Coordinate(x, y);

				if (!draftBackground.intersection(componentCoordinates, topLeft)) {
					position = candidate;
					break;
				}
			}

			if (position === null) {
				// the default position is the center of the image.
				var x = Math.floor(draftBackground.width/2);
				var y = Math.floor(draftBackground.height/2);
				var position = new Coordinate(x, y);
			}

			this.position = {
				x: position.x - this.bbox.width/2 - this.bbox.start.x,
				y: position.y - this.bbox.height/2 - this.bbox.start.y
			};

			draftBackground.writeText(this.text, this.getSize(), true, this.fontWeight, this.fontName, this.position);
		};

		Word.prototype.paint = function(finalBackground) {

			finalBackground.writeText(this.text, this.getSize(), false, this.fontWeight, this.fontName, this.position);
		};

		return Word;
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
			this.finalBackground = new Background(width, height, 'wordcloud', false);

			this.bagOfWords = [];
		}

		WordCloud.prototype.getWord = function(text, createIfNonExistent) {

			for (var i=0; i<this.bagOfWords.length; i++) {
				var word = this.bagOfWords[i];
				if (word.text === text) {
					return word;
				}
			}
			
			// else:
			if (createIfNonExistent) {
				var word = new Word(text, this.fontweight, this.fontname);
				this.bagOfWords.push(word);
				return word;
			} else {
				return undefined;
			}
		};

		WordCloud.prototype.updateBagOfWords = function(message) {

			var textualWords = message.getWords();

			if (message.isActive) {
				for (var i=0; i<textualWords.length; i++) {
					var text = textualWords[i];
					var word = this.getWord(text, true);
					word.incrementFrequency();
				}
			}
			else {
				for (var i=0; i<textualWords.length; i++) {
					var text = textualWords[i];
					var word = this.getWord(text, false);
					if (word !== undefined) {
						word.decrementFrequency();
					}
				}
			};

			// remove all Word()s with a frequency of zero.
			this.bagOfWords = this.bagOfWords.filter(function(el){return el.frequency>0});
		};

		WordCloud.prototype.triggerRequiredCalculations = function() {
			
			// sort the words by frequency (largest first)
			this.bagOfWords.sort( function compare(a, b) {
				if (a.frequency < b.frequency) return 1;
				else if (a.frequency > b.frequency) return -1;
				else return 0;
			});

			// go through the list in order, and once you've seen the first dirty word, set all following words to be dirty.
			var forcePositionGeneration = false;
			for (var i=0; i<this.bagOfWords.length; i++) {
				var word = this.bagOfWords[i];

				if (word.frequencyIsDirty) {
					word.generateImage();
					forcePositionGeneration = true;
				}

				if (forcePositionGeneration) {
					word.generatePosition(this.draftBackground);
				}
			}
		};

		WordCloud.prototype.updateOnMessage = function(message) {

			var startTime = Date.now();

			this.draftBackground.clear();
			this.finalBackground.clear();

			this.updateBagOfWords(message);
			this.triggerRequiredCalculations();
			this.paint();

			console.log('total wordCloud time :', (Date.now()-startTime)/1000);
		};

		WordCloud.prototype.paint = function() {

			for (var text in this.bagOfWords) {
				var word = this.bagOfWords[text];
				word.paint(this.finalBackground);
			}
		};


		return WordCloud;
	})();

	window['WordCloud'] = WordCloud;
})();
