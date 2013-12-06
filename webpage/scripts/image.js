var Image = (function () {

    function Image (imageData) {
        this.raw = imageData;
        this.data = imageData.data;
        this.width = imageData.width;
        this.height = imageData.height;

        this.coordinateSet = new CoordinateSet(this);
    }

    Image.prototype.getPixel = function (coordinate) {
        // we only return the alpha value, on the assumption that all colored pixels must have a
        // non-zero alpha value.
        var pixelIndex = constants.NUM_CHANNELS * (coordinate.y * this.width + coordinate.x);
        var alpha = this.data[pixelIndex + constants.ALPHA_CHANNEL];
        return alpha;
    };

    Image.prototype.getOrderedCoordinates = function (orderType, ignoreWhitePixels) {
        return this.coordinateSet.getOrderedCoordinates(orderType, ignoreWhitePixels);
    };

    return Image;
})();
