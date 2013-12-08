var Coordinate = (function () {

    function Coordinate(x, y) {
        this.x = x;
        this.y = y;
    }

    Coordinate.prototype.apply = function(x, y) {
        // add a vector in place, instead of returning a new vector.
        
        if (y === undefined) {
            var other = x;          // if y is undefined, we treat x like a coordinate
            this.x += other.x;
            this.y += other.y;
        } 
        else {
            this.x += x;
            this.y += y;
        }

        return this;    // to allow chaining.
    }

    Coordinate.prototype.sum = function (other) {
        var x = this.x + other.x;
        var y = this.y + other.y;
        return new Coordinate(x, y);
    };

    Coordinate.prototype.difference = function (other) {
        var x = this.x - other.x;
        var y = this.y - other.y;
        return new Coordinate(x, y);
    };

    Coordinate.prototype.distance = function (other) {
        var dif = this.difference(other);
        var distance = Math.sqrt(dif.x * dif.x + dif.y * dif.y);
        return distance;
    };

    Coordinate.prototype.paint = function (canvas) {
        canvas.context.fillStyle = 'red';
        canvas.context.fillRect(this.x, this.y, 1, 1);
    };
    return Coordinate;
})();