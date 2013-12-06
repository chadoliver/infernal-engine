var Background = (function () {
    
    function Background(id) {
        this.canvas = new Canvas(600, 600).attach(id);
        this.image = this.readImage();
    }

    Background.prototype.readImage = function () {
        return this.canvas.readImage();
    };

    Background.prototype.readPixel = function (position) {
        return this.image.getPixel(position);
    };

    Background.prototype.write = function (image, position) {
        this.canvas.writeImage(image, position);
        this.image = this.readImage();
    };

    Background.prototype.clear = function () {
        this.canvas.clear();
    };

    Background.prototype.intersection = function (subjectCoordinates, offset) {

        for (var i=0; i<subjectCoordinates.length; i++) {

            var coordinate = subjectCoordinates[i].sum(offset);
            var pixel = this.readPixel(coordinate);

            if (pixel !== 0) {
                return true;
            }
        }

        // if we get this far, then there was no intersection between the wordcloud and the image.
        return false;
    };

    Background.prototype.getOrderedCoordinates = function () {
        return this.image.getOrderedCoordinates(constants.ordering.DISTANCE, constants.whitePixels.INCLUDE);
    };

    return Background;
})();
