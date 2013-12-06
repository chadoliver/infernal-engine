//var stopwatch = new Stopwatch();

starter.wait(function () {

    var background = new Background('wordcloud');
    var coordinates = background.getOrderedCoordinates();

    //for (var i = 0; i < Math.min(200000, coordinates.length); i++) coordinates[i].paint(background.canvas);

    

    //stopwatch.start('started');

    var words = [new Word('plume', 10), new Word('fire', 7), new Word('dead', 2)];
    for (var i=0; i<words.length; i++) words[i].paint(background);

    //background.blur(5);

    //stopwatch.stop('stopped');
});
