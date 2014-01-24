var WordCloud = (function() {

	var constants = {

		NUM_CHANNELS: 4,
		ALPHA_CHANNEL: 3,

		TEXT_SIZE_CONSTANT: 10,
		TEXT_SIZE_MULTIPLIER: 3,
		TEXT_BASELINE: 'top',
		BLUR_RADIUS: 8,
		TRANSPARENT: 255,

		HORIZONTAL_SCALING_FACTOR: 1,
		VERTICAL_SCALING_FACTOR: 1.5,

		NUM_PIXEL_SETS: 10,
	};

	//===========================================================================================================//

	var Coordinate = (function() {
		// A coordinate represents a position in some cartesian coordinate system.

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

		Coordinate.prototype.paint = function(canvas) {
			canvas.context.fillStyle = 'red';
			canvas.context.fillRect(this.x - 1, this.y - 1, 3, 3);
		};

		return Coordinate;
	})();

	//===========================================================================================================//

	var Image = (function() {
		// The image class wraps the results of getImageData(). In essense, it's just an array of pixels.

		function Image(imageData) {
			this.raw = imageData;
			this.data = imageData.data;
			this.width = imageData.width;
			this.height = imageData.height;

			this.coordinates = null;
		}

		Image.prototype.getPixel = function(x, y) {
			// we only return the alpha value, on the assumption that all colored pixels must have a
			// non-zero alpha value.
			var pixelIndex = constants.NUM_CHANNELS * (y * this.width + x);
			var alpha = this.data[pixelIndex + constants.ALPHA_CHANNEL];
			return alpha;
		};

		Image.prototype.getBlackCoordinates = function() {
			// We don't want to have to generate the coordinates each time, so we memoize them.

			if (this.coordinates === null) {

				this.coordinates = [];

				for (var y = 0; y < this.height; y++) {
					for (var x = 0; x < this.width; x++) {
						var pixelIndex = constants.NUM_CHANNELS * (y * this.width + x);
						var alpha = this.data[pixelIndex + constants.ALPHA_CHANNEL];
						if (alpha > 0) {
							this.coordinates.push( new Coordinate(x, y));
						}
					}
				}
			}

			return this.coordinates;
		};

		return Image;
	})();

	//===========================================================================================================//

	var Canvas = (function() {
		// This class provides a wrapper around the HTML5 Canvas element.

		function Canvas(width, height) {
			this.element = document.createElement("canvas");
			this.element.width = width;
			this.element.height = height;
			this.parent = null;

			this.context = this.element.getContext('2d');
		}

		Canvas.prototype.attach = function(parentId) {
			this.parent = document.getElementById(parentId);
			this.parent.appendChild(this.element);

			return this;
		};

		Canvas.prototype.clear = function() {
			this.context.clearRect(0, 0, this.element.width, this.element.height);
		};

		Canvas.prototype.writeText = function(text, size, isBlurred, fontWeight, fontName, position) {
			// write some text to the canvas, and return the width of the text in pixels.

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
			// Write an instance of Image to the canvas. Note that position is a Coordinate which specifies the *center* 
			// of the image, but putImageData() expect that position indicates the *top left* corner.

			var x = position.x - image.width / 2;
			var y = position.y - image.height / 2;
			var topLeft = new Coordinate(x, y);

			this.context.putImageData(image.raw, topLeft.x, topLeft.y);
		};

		Canvas.prototype.readImage = function(bbox) {
			// Read the canvas (or an area of the canvas described by a bounding box) and return an instance of Image.

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
		// Backgrounds are canvas elements on which words are written and aggregated. 
		// Wordclouds have two Backgrounds. The first is the canvas element which displays the final image, and the 
		// second is a hidden canvas which mirrors the first except that words are blurred. (The blurring is used to
		// provide padding between words.)

		function Background(width, height, id, generateCoordinates) {
			this.width = width;
			this.height = height;
			this.coordinates = null;

			this.canvas = new Canvas(width, height);

			if (id !== undefined) {
				this.canvas.attach(id);
			}

			if (generateCoordinates) {
				this.getCoordinates(); // we call getCoordinates() in order to pre-memoize the result, not because we actually want the result yet.
			}

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

		Background.prototype.clear = function() {
			// reset the canvas to the original state (that is, exceedingly white).
			this.canvas.clear();
			this.image = this.readImage();
		};

		Background.prototype.binarize = function() {
			// Transform the canvas so that all non-white pixels are fully black. This is just a debugging function
			// that I use to examine the quality of my positioning algorithm.
			
			for (var i=0; i<this.coordinates.length; i++) {
				var coordinate = this.coordinates[i];
				var pixel = this.image.getPixel(coordinate.x, coordinate.y);
				if (pixel !== 0) {
					var pixelIndex = constants.NUM_CHANNELS * (coordinate.y*this.width + coordinate.x);
					this.image.data[pixelIndex+constants.ALPHA_CHANNEL] = constants.TRANSPARENT;
				}
			}
			this.canvas.context.putImageData(this.image.raw, 0, 0);
		};

		Background.prototype.getCoordinates = function() {
			// Return a list of all coordinates (effectively, pixels) in the image, ordered by distance from the center. This is roughly 
			// equivalent to image.getBlackCoordinates, except that it returns all pixels, not just black ones.

			if (this.coordinates === null) {

				this.coordinates = [];
				var center = new Coordinate(this.width/2, this.height/2);

				// generate all coordinates.
				for (var y = 0; y < this.height; y++) {
					for (var x = 0; x < this.width; x++) {
						this.coordinates.push(new Coordinate(x, y, center));
					}
				}

				// sort the coordinates by distance from the center of the background.
				this.coordinates.sort(function compare(a, b) {
					if (a.distanceToCenter < b.distanceToCenter) return -1;
					if (a.distanceToCenter > b.distanceToCenter) return 1;
					else return 0;
				});	
			}

			return this.coordinates;	
		};

		Background.prototype.intersection = function(image, candidatePos) {
			// Take an image (representing a single word) and a potential position where this word might be placed. Return a 
			// boolean value which indicates whether any black pixels in the word intersect with any black pixels in the background.

			var coordinates = image.getBlackCoordinates();

			// candidatePos gives the center of the image (word), so we need to find the position of the top left corner.
			var cornerX = Math.floor(candidatePos.x - image.width / 2);
			var cornerY = Math.floor(candidatePos.y - image.height / 2);

			var numSets = constants.NUM_PIXEL_SETS;
			var numCoordinates = coordinates.length;

			for (var pixelSet=0; pixelSet<numSets; pixelSet++) {
				for (var i=pixelSet; i<numCoordinates; i+=numSets) {

					var x = coordinates[i].x + cornerX;
					var y = coordinates[i].y + cornerY;
					if (this.image.getPixel(x, y) !== 0) {
						return true;	// pixels intersect, so this can't be a valid position for placing the word.
					}
				}
			}

			// if we get this far, then there was no intersection between the wordcloud and the image. Yay! This is a valid position.
			return false;
			
		};

		return Background;
	})();


	//===========================================================================================================//


	var BoundingBox = (function() {
		// This class, rather intuitively, represents a region within a coordinate system. Specifically, we use it 
		// to find the minimum bounding box of a word.
		
		function BoundingBox(image, width) {

			// The word is written at the position [0,0], thus xMin must be 0. Furthermore, we know xMax from 
			// ctx.measureText(text).width.
			var xMin = 0;				
			var xMax = width;

			// Sadly, there's no cheat method for finding the yMin and yMax. We have to find them the hard way.
			var yMin = image.height;	// Guaranteed to be bigger than the real value.
			var yMax = 0;				// Guaranteed to be smaller than the real value.

			for (var y = 0; y < image.height; y += 2) {	// examine every second row
				for (var x = xMin; x < xMax; x += 2) {	// examine every second pixel in the row
					
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
		// Yeah, so this class represents words. Who knew?

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
			// Iterate through all possible positions where the word could be placed, and return the first position 
			// which doesn't cause the word to intersect with any other words. Note that the possible positions are
			// ordered by distance to the center (closest first) so the *first* non-intersecting position will also be 
			// the *most central* non-intersecting position.
			
			this.generateImage();
			
			var candidatePositions = draftBackground.getCoordinates();
			var len = candidatePositions.length;
			var position = null;

			for (var i = 0; i < len; i+=3) {
				var candidate = candidatePositions[i];
				if (!draftBackground.intersection(this.image, candidate)) {
					position = candidate;
					break;
				}
			}

			if (position === null) {
				var position = new Coordinate(0,0);
			}

			return position;
		};

		Word.prototype.paint = function(draftBackground, finalBackground) {
			// Draw the word on the background. This is arguably the most important function in the whole file

			var wordCenter = this.findPosition(draftBackground);

			var position = {
				x: wordCenter.x - this.bbox.width / 2 - this.bbox.start.x,
				y: wordCenter.y - this.bbox.height / 2 - this.bbox.start.y
			};

			draftBackground.writeText(this.text, this.size, true, this.fontWeight, this.fontName, position);
			finalBackground.writeText(this.text, this.size, false, this.fontWeight, this.fontName, position);
		};

		return Word;
	})();


	//===========================================================================================================//

	var DeferredProcessor = (function() {
		// We use a deferred process to avoid blocking the UI. Remember that Javascript runs in a single thread, and 
		// events can only be handled once the call stack is empty (that is, once the current program 'returns' all
		// the way back to the global context). Thus, when we call WordCloud.paint(), all events are blocked until 
		// the function returns.
		// The solution is to break the task into smaller chunks (mostly, these chunks are individual calls to 
		// word.paint), and to 'remotely' schedule their execution by making them the callback for a timeout. With 
		// this approach, WordCloud.paint returns very quickly, and all events (UI, Instant, and deferred tasks) 
		// are processed in order.
	
		function DeferredProcessor() {
			
			this.queue = [];
			this.timeout = null;
		}

		DeferredProcessor.prototype.process = function() {
			// dequeue a task from the queue, and process it.

			var item = this.queue.shift();	// dequeue one job
			item.job.apply(item.context, item.args);

			if (this.queue.length === 0) {
				this.timeout = null;
			} else {
				this.timeout = setTimeout(this.process.bind(this), 0);
			}
		};

		DeferredProcessor.prototype.push = function(job, context, args) {
			// schedule a task for processing.

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
		// Currently, the wordcloud is only built once (when the page loads). An important future job would be to 
		// make it dynamic, so that it is built progressively (and torn down) as messages are activated and call 
		// .updateOnMessage().

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
			// Calculate the position for each word, and draw the words to the canvas.

			// sort the words by frequency.
			this.words.sort(function compare(a, b) {
				if (a.size < b.size) return 1;
				if (a.size > b.size) return -1;
				else return 0;
			});	

			// queue actions to clear this.draftBackground and this.finalBackground.
			this.deferredProcessor.push(this.draftBackground.clear, this.draftBackground);
			this.deferredProcessor.push(this.finalBackground.clear, this.finalBackground);

			for (var i=0; i<this.words.length; i++) {
				var word = this.words[i];
				this.deferredProcessor.push(word.paint, word, [this.draftBackground, this.finalBackground]);
			}
		};

		WordCloud.prototype.test = function(numIterations) {
			// I use this function for debugging purposes.
			console.log(Date.now());
			for (var i=0; i<numIterations; i++) {
				this.paint();
			}
			//this.deferredProcessor.push(this.draftBackground.binarize, this.draftBackground);
			this.deferredProcessor.push(function(){console.log(Date.now())}, this);
		};

		WordCloud.prototype.updateOnMessage = function(message) {
			//console.log('wordcloud: received message');
		};

		return WordCloud;
	})();

	return WordCloud;
})();
