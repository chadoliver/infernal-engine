var Word = (function () {

    function Word(text, frequency) {
        var self = this;

        this.text = text;
        this.frequency = frequency;

        var size = 20 + 2 * frequency;
        var canvas = new Canvas(600, 200);
        canvas.writeText(this.text, size, true);

        var fullImage = canvas.readImage();
        var bbox = new BoundingBox(fullImage);
        this.image = canvas.readImage(bbox);
    }

    Word.prototype.findPosition = function (background) {
        var componentCoordinates = this.getOrderedCoordinates();        // this is a list of all coordinates for black pixels in this.image, in random order.
        var candidatePositions = background.getOrderedCoordinates();    // this is a list of all coordinates for pixels in background.image, ordered by distance from the center.

        for (var i=0; i<candidatePositions.length; i++) {
            var position = candidatePositions[i];

            var x = Math.floor(position.x - this.image.width/2);
            var y = Math.floor(position.y - this.image.height/2);
            var offset = new Coordinate(x, y);
            //console.log('offset:', offset);

            if (!background.intersection(componentCoordinates, offset)) {
                return position;
            }
        }
        return new Coordinate(300,300);
    };

    Word.prototype.paint = function (background) {
        var position = this.findPosition(background);
        console.log(position.x, position.y);
        background.write(this.image, position);
    };

    Word.prototype.getOrderedCoordinates = function () {
        return this.image.getOrderedCoordinates(constants.ordering.RANDOM, constants.whitePixels.EXCLUDE);
    };

    return Word;
})();