starter.wait(function () {

    var wordCloud = new WordCloud('wordcloud', constants.FONT_WEIGHT, constants.FONT_NAME);

    wordCloud.putWord('scrub', 13);
    wordCloud.putWord('plume', 10);
    wordCloud.putWord('black', 8);
    wordCloud.putWord('fire', 7);
    wordCloud.putWord('wind-driven', 4);
    wordCloud.putWord('dead', 2);

    wordCloud.paint();
});
