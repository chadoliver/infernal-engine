starter.wait(function () {

    var map = new Map('SATELLITE', 11, new Location(-43.38, 171.22));

    //===========================================================================================================//

    var wordCloud = new WordCloud('wordcloud', constants.FONT_WEIGHT, constants.FONT_NAME);

    wordCloud.putWord('scrub', 13);
    wordCloud.putWord('plume', 10);
    wordCloud.putWord('black', 8);
    wordCloud.putWord('fire', 7);
    wordCloud.putWord('jiff', 5);
    wordCloud.putWord('wind-driven', 4);
    wordCloud.putWord('dead', 3);
    wordCloud.putWord('cheese', 2);
    wordCloud.putWord('wooler', 2);
    wordCloud.putWord('triskele', 2);
    wordCloud.putWord('gasp', 2);
    wordCloud.putWord('hennig', 1);

    wordCloud.paint();

    //===========================================================================================================//

    var sampleTimeSpeedup = 7;
    var zeroTime = 0; 
    var timeController = new TimeController(zeroTime, sampleTimeSpeedup);

    var personSet = new PersonSet(map);
    personSet.putPerson(1, 'Tim');
    personSet.putPerson(2, 'Jerry');
    personSet.putPerson(3, 'Russel');
    personSet.putPerson(4, 'Norman');

    var actionSet = new ActionSet(timeController, personSet);
    /*actionSet.putAction('1 foo bar baz', new Location(-43.38, 171.22), 1, 12000);   // time is in milliseconds of sample time.
    actionSet.putAction('2 foo bar baz', new Location(-43.43, 171.18), 2, 24000);
    actionSet.putAction('3 foo bar baz', new Location(-43.41, 171.33), 3, 36000);
    actionSet.putAction('4 foo bar baz', new Location(-43.415, 171.34), 4, 48000);
    */

    timeController.begin();


    //===========================================================================================================//

    window['map'] = map;
    window['timeController'] = timeController; 
});
