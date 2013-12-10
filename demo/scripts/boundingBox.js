var BoundingBox = (function () {

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

    BoundingBox.prototype.paint = function (canvas, color) {
        canvas.context.strokeStyle = color;
        canvas.context.strokeRect(this.start.x, this.start.y, this.width, this.height);
    };

    return BoundingBox;
})();