var CoordinateSet = (function() {

    function orderByDistance (coordinates, center) {

        coordinates.sort(function compare(a, b) {
            var distanceA = a.distance(center);
            var distanceB = b.distance(center);

            if (distanceA < distanceB) return -1;
            if (distanceA > distanceB) return 1;
            else return 0;
        });

        return coordinates;
    };

    function randomize (coordinates) {

        var currentIndex = coordinates.length;
        var temporaryValue = null;
        var randomIndex = null;

        while (currentIndex !== 0) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = coordinates[currentIndex];
            coordinates[currentIndex] = coordinates[randomIndex];
            coordinates[randomIndex] = temporaryValue;
        }

        return coordinates;
    };

    function CoordinateSet (image) {
        this.coordinates = [];
        this.width = image.width;
        this.height = image.height;
        this.image = image;

        for (var y = 0; y < image.height; y++) {
            for (var x = 0; x < image.width; x++) {
                var coordinate = new Coordinate(x, y);
                this.coordinates.push(coordinate);
            }
        }
    }

    CoordinateSet.prototype.filter = function (coordinates, whitePixels) {
        var coordinates = [];

        if (whitePixels = constants.whitePixels.EXCLUE) {
            for (var i = 0; i < this.coordinates.length; i++) {
                var coordinate = this.coordinates[i];
                if (this.image.getPixel(coordinate) > 0) {
                    coordinates.push(coordinate);
                }
            }
        } else {
            coordinates = this.coordinates;
        }

        return coordinates;
    };

    CoordinateSet.prototype.getOrderedCoordinates = function (orderType, ignoreWhitePixels) {

        var coordinates = this.filter(this.coordinates, ignoreWhitePixels);

        if (orderType === constants.ordering.DISTANCE) {
            var center = new Coordinate(this.width / 2, this.height / 2);
            return orderByDistance(coordinates, center);
        } else {
            return randomize(coordinates);
        }
    };

    return CoordinateSet;
})();