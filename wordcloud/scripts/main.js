//var stopwatch = new Stopwatch();

starter.wait(function () {

    var background = new Background('wordcloud');
    var coordinates = background.getOrderedCoordinates();

    //for (var i = 0; i < Math.min(200000, coordinates.length); i++) coordinates[i].paint(background.canvas);

    

    //stopwatch.start('started');

    var words = [
    	new Word('scrub', 11), 
    	new Word('plume', 10), 
    	new Word('black', 8),
    	new Word('fire', 7), 
    	new Word('wind-driven', 4),
    	new Word('dead', 2),
    ];

    for (var i=0; i<words.length; i++) words[i].paint(background);

	var center = new Coordinate(300,300);
	center.paint(background.canvas);


    //background.blur(5);

    //stopwatch.stop('stopped');
});
