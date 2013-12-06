var Canvas = (function () {

    function Canvas(width, height) {
        this.element = document.createElement("canvas");
        this.element.width = width;
        this.element.height = height;
        this.parent = null;

        this.context = this.element.getContext('2d');
    }

    Canvas.prototype.attach = function (parentId) {
        var parent = document.getElementById(parentId);
        parent.appendChild(this.element);

        this.parent = parentId;

        return this;
    };

    Canvas.prototype.clear = function () {
        this.context.clearRect(0, 0, this.element.width, this.element.height);
    };

    Canvas.prototype.writeText = function (text, size, blur, position) {
        
        if (position === undefined) position = new Coordinate(0, 0);

        this.context.textBaseline = constants.TEXT_BASELINE;
        this.context.font = constants.FONT_WEIGHT.toString() + ' ' + size.toString() + 'px ' + constants.FONT_NAME;
        this.context.shadowColor = 'black';
        
        if (blur) this.context.shadowBlur = constants.BLUR_RADIUS;
        else this.context.shadowBlur = 0;
        
        this.context.fillText(text, position.x, position.y);
    };

    Canvas.prototype.writeImage = function (image, position) {
        // position is a Coordinate which specifies the *center* of the image, but putImageData() expect that position indicates the *top left* corner.
        var x = position.x - image.width/2;
        var y = position.y - image.height/2;
        var topLeft = new Coordinate(x, y);

        this.context.putImageData(image.raw, topLeft.x, topLeft.y);
    };

    Canvas.prototype.readImage = function (bbox) {
        var imageData;

        if (bbox === undefined) {
            // make an Image from the whole canvas
            imageData = this.context.getImageData(0, 0, this.element.width, this.element.height);
        } else {
            // make an Image from the area defined by bbox
            imageData = this.context.getImageData(bbox.start.x, bbox.start.y, bbox.width+1, bbox.height+1);
        }

        return new Image(imageData);
    };

    return Canvas;
})();