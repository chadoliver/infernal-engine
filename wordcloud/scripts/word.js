var Word = (function () {

    var getImage = function (text, size, isBlurred) {
        var canvas = new Canvas(600, 200);
        canvas.writeText(text, size, isBlurred);
        var fullImage = canvas.readImage();
        var bbox = new BoundingBox(fullImage);
        return canvas.readImage(bbox);
    };

    function Word(text, frequency) {
        var self = this;
        var size = 10 + 3 * frequency;

        this.text = text;
        this.frequency = frequency;
        this.draftImage = getImage(text, size, true);    // get a blurred image that we use to find the word's position.
        this.finalImage = getImage(text, size, false);   // get a normal image that we'll display in the wordcloud.
    }

    Word.prototype.findPosition = function (background) {
        var componentCoordinates = this.getOrderedCoordinates();        // this is a list of all coordinates for black pixels in this.image, in random order.
        var candidatePositions = background.getOrderedCoordinates();    // this is a list of all coordinates for pixels in background.image, ordered by distance from the center.

        for (var i=0; i<candidatePositions.length; i++) {
            var position = candidatePositions[i];

            var x = Math.floor(position.x - this.draftImage.width/2);
            var y = Math.floor(position.y - this.draftImage.height/2);
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
        background.write(this.finalImage, position);
    };

    Word.prototype.getOrderedCoordinates = function () {
        return this.draftImage.getOrderedCoordinates(constants.ordering.RANDOM, constants.whitePixels.EXCLUDE);
    };

    return Word;
})();