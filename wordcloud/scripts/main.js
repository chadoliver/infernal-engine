starter.wait(function () {

    var map = new Map('SATELLITE', 11, new Location(-43.38, 171.22));

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

    var sampleTimeSpeedup = 10;
    var zeroTime = 0; 
    var timeController = new TimeController(zeroTime, sampleTimeSpeedup);

    var personSet = new PersonSet(map);
    personSet.putPerson(1, 'Tim');
    personSet.putPerson(2, 'Jerry');
    personSet.putPerson(3, 'Russel');
    personSet.putPerson(4, 'Norman');

    var actionSet = new ActionSet(timeController, personSet);
    actionSet.putAction("The fire truck has arrived. Where do you want it?", new Location(-43.41, 171.33), 1, 12000);   // time is in milliseconds of sample time.
    actionSet.putAction("We've only got a small 2m by 2m fire in the grass.", new Location(-43.43, 171.18), 2, 24000);
    actionSet.putAction("The fire here is looking to jump over the road." , new Location(-43.38, 171.22), 3, 36000);
    actionSet.putAction("Send the fire truck over to Russel.", new Location(-43.415, 171.34), 4, 48000);


    timeController.begin();


    //===========================================================================================================//

    window['map'] = map;
    window['timeController'] = timeController; 
});
