starter.wait(function () {

    var map = new Map('SATELLITE', 13, [-42.72994625445004, 171.6904809188843]);

    //===========================================================================================================//

    var wordCloud = new WordCloud('wordcloud', constants.FONT_WEIGHT, constants.FONT_NAME);

    wordCloud.putWord('scrub', 13);
    wordCloud.putWord('plume', 10);
    wordCloud.putWord('black', 8);
    wordCloud.putWord('fire', 7);
    wordCloud.putWord('jiff', 5);
    wordCloud.putWord('plume-driven', 4);
    wordCloud.putWord('bubble', 3);
    wordCloud.putWord('cheese', 2);
    wordCloud.putWord('wooler', 2);
    wordCloud.putWord('triskele', 2);
    wordCloud.putWord('gasp', 2);
    wordCloud.putWord('hennig', 1);

    wordCloud.paint();

    //===========================================================================================================//

    var messageBoard = new MessageBoard('messages');

    //===========================================================================================================//

    var sampleTimeSpeedup = 10;
    var zeroTime = 20*1000;
    var endTime = 300*1000;
    var timeController = new TimeController(zeroTime, endTime, sampleTimeSpeedup);

    var markerSet = new MarkerSet(map);
    markerSet.createMarker(1, 'Tim');
    markerSet.createMarker(2, 'Jerry');
    markerSet.createMarker(3, 'Russel');
    markerSet.createMarker(4, 'Norman');

    var dataModel = new DataModel(timeController, markerSet, messageBoard, wordCloud);
    dataModel.createAction( "The fire truck has arrived. Where do you want it?",  [-43.41, 171.33],  1, 22000 );   // time is in milliseconds of sample time.
    dataModel.createAction( "We've only got a small 2m by 2m fire in the grass.", [-43.43, 171.18],  2, 28000 );
    dataModel.createAction( "The fire here is looking to jump over the road." ,   [-43.38, 171.22],  3, 36000 );
    dataModel.createAction( "Send the fire truck over to Russel.",                [-43.415, 171.34], 4, 48000 );
    dataModel.createAction( null,                                                 [-43.42, 171.34],  4, 50000 );
    dataModel.createAction( null,                                                 [-43.425, 171.34], 4, 52000 );

    timeController.begin();

    //===========================================================================================================//

    window['map'] = map;
    window['timeController'] = timeController; 
});
